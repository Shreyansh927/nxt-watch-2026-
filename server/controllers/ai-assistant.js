import { GoogleGenAI } from "@google/genai";
import { parse } from "dotenv";
import { movieDb } from "../config/movieDB.js";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateResponse = async (command, context) => {
  try {
    const prompt = `
You are an AI assistant for a movie app.

always remember user previous command and context and use that to understand his next command 
this is the context ${JSON.stringify(context)}

Now user will give you command related to movie playlist management like creating playlist, adding movie to playlist, removing movie from playlist, adding top movies of a genre to playlist etc.

Convert user input into JSON.
he can write playlist name and movie name in any format but you have to extract them and return in JSON format.
also he can spell playlist as list or folder or any other word but you have to understand that and extract playlist name and movie name from his command.

he might give list of work like add movie to playlist, create playlist, add top movies, remove movie etc but you have to understand his command and extract playlist name and movie name from his command.

he might also ask you "add xyz movie and abc movies in different list or same list" so you have to understand that and extract playlist name and movie name from his command, then give result in array of json format.

Supported actions:
1. add_movie_to_playlist
2. create_playlist
3. add_top_movies
4. remove_movie

if only single action is to be performed then return JSON in this format:
{
  "action": "",
  "movie": "",
  "playlist": "",
  "count": "",
  "genre": ""
}

else if multiple action is to be performed then return JSON in this format:
[
  {
    "action": "",
    "movie": "",
    "playlist": "",
    "count": "",
    "genre": ""
  },
  {
    
    "action": "",
    "movie": "",
    "playlist": "",
    "count": "",
    "genre": ""
  }
]


If request is unrelated, return:
{
  "action": "unknown"
}

User input: ${command}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return (
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated"
    );
  } catch (err) {
    console.error("Gemini Error:", err.response?.data || err.message);
    throw err;
  }
};

const tools = {
  create_playlist: async ({ playlist }, userId) => {
    try {
      const folderExists = await movieDb.query(
        `SELECT id FROM watch_later_folders WHERE watch_later_folder_name = $1 AND user_id = $2`,
        [playlist, userId],
      );

      if (folderExists.rows.length > 0) {
        return `Playlist "${playlist}" already exists`;
      }
      await movieDb.query(
        `INSERT INTO watch_later_folders (user_id, watch_later_folder_name, watch_later_folder_status, created_at) VALUES ($1, $2, 'Private', NOW())`,
        [userId, playlist],
      );
      return `Playlist "${playlist}" created successfully`;
    } catch (err) {
      console.error("Error creating playlist:", err);
      return "Error creating playlist";
    }
  },
  add_movie_to_playlist: async ({ movie, playlist }, userId) => {
    try {
      const movieAlreadyAdded = await movieDb.query(
        `SELECT id FROM watch_later_files 
WHERE movie_name = $1 AND folder_name = $2 AND user_id = $3`,
        [movie, playlist, userId],
      );

      if (movieAlreadyAdded.rows.length > 0) {
        return `Movie "${movie}" is already in playlist "${playlist}"`;
      }

      const movieId = await movieDb.query(
        `SELECT id FROM movies 
WHERE LOWER(title) LIKE '%' || LOWER($1) || '%'`,
        [movie],
      );

      if (movieId.rows.length === 0) {
        return `Movie "${movie}" not found in database`;
      }
      const folderId = await movieDb.query(
        `SELECT id FROM watch_later_folders WHERE watch_later_folder_name = $1 AND user_id = $2`,
        [playlist, userId],
      );

      if (folderId.rows.length === 0) {
        return `Playlist "${playlist}" not found`;
      }

      await movieDb.query(
        `INSERT INTO watch_later_files (user_id, folder_id, movie_id, added_at, folder_name , movie_name) VALUES ($1, $2, $3, NOW(), $4 ,$5)`,
        [userId, folderId.rows[0].id, movieId.rows[0].id, playlist, movie],
      );

      return `Movie "${movie}" added to playlist "${playlist}" successfully`;
    } catch (err) {
      console.error("Error adding movie to playlist:", err);
      return "Error adding movie to playlist";
    }
  },
  remove_movie: async ({ movie, playlist }, userId) => {
    try {
      const folderId = await movieDb.query(
        `SELECT id FROM watch_later_folders WHERE watch_later_folder_name = $1 AND user_id = $2`,
        [playlist, userId],
      );

      if (folderId.rows.length === 0) {
        return `Playlist "${playlist}" not found`;
      }

      await movieDb.query(
        `DELETE FROM watch_later_files WHERE folder_id = $1 AND movie_name = $2 AND user_id = $3`,
        [folderId.rows[0].id, movie, userId],
      );
      return `Movie "${movie}" removed from playlist "${playlist}" successfully`;
    } catch (err) {
      console.error("Error removing movie from playlist:", err);
      return "Error removing movie from playlist";
    }
  },
};

const executionBrain = async (parsed, userId) => {
  const { action } = parsed;

  if (!action || action === "unknown") {
    return "Sorry, I couldn't understand your request.";
  }

  if (!tools[action]) {
    return "Sorry, I don't have a tool for that action.";
  }

  return await tools[action](parsed, userId);
};

export const getAiHelp = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    let context = [];

    const memoryResult = await movieDb.query(
      `SELECT query, response FROM user_ai_assistant_memory WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [req.user.id],
    );

    memoryResult.rows.map((row) => {
      context = [...context, { query: row.query, response: row.response }];
    });

    const aiResponse = await generateResponse(command, context);

    const cleanResponse = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanResponse);

    console.log("Parsed:", parsed);
    console.log(parsed["action"]);
    console.log(parsed["movie"]);
    console.log(parsed["playlist"]);
    console.log(parsed["count"]);
    console.log(parsed["genre"]);

    const messages = Array.isArray(parsed)
      ? await Promise.all(
          parsed.map((item) => executionBrain(item, req.user.id)),
        )
      : [await executionBrain(parsed, req.user.id)];

    await movieDb.query(
      `INSERT INTO user_ai_assistant_memory (user_id, query, response, created_at) VALUES ($1, $2, $3, NOW())`,
      [req.user.id, command, messages.join("\n")],
    );

    return res.status(200).json({
      response: messages,
    });
  } catch (err) {
    console.error("AI Assistant Error:", err);
    return res.status(500).json({
      error: "Error processing AI assistant request",
    });
  }
};
