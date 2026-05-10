import { movieDb } from "../config/movieDB.js";

import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";

import { z } from "zod";

import { createAgent } from "langchain";

/* ===
   MODEL (Gemini Flash) ===== */

const llm = new ChatOllama({
  model: "llama3.2:1b",
  temperature: 0,
  baseUrl: "https://nxt-watch-2026-ollama-server.onrender.com",
});

/* ==
   TOOL 1: CREATE PLAYLIST
======== */

const createPlaylistTool = tool(
  async ({ playlist, userId }) => {
    const existingPlaylist = await movieDb.query(
      `
        SELECT id
        FROM watch_later_folders
        WHERE watch_later_folder_name = $1
        AND user_id = $2
        `,
      [playlist, userId],
    );

    if (existingPlaylist.rows.length > 0) {
      return `Playlist "${playlist}" already exists`;
    }

    await movieDb.query(
      `
      INSERT INTO watch_later_folders
      (
        user_id,
        watch_later_folder_name,
        watch_later_folder_status,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        'Private',
        NOW()
      )
      `,
      [userId, playlist],
    );

    return `Playlist "${playlist}" created successfully`;
  },
  {
    name: "create_playlist",
    description: "Create a new movie playlist or folder",

    schema: z.object({
      playlist: z.string(),
      userId: z.number(),
    }),
  },
);

const togglePlaylistStatusTool = tool(
  async ({ userId, playlist, playlistStatus }) => {
    const doesPlaylistExists = await movieDb.query(
      `
      SELECT id, watch_later_folder_status
      FROM watch_later_folders
      WHERE LOWER(watch_later_folder_name) = LOWER($1)
      AND user_id = $2
      `,
      [playlist, userId],
    );

    if (!doesPlaylistExists.rows.length) {
      return `Playlist "${playlist}" not found`;
    }

    await movieDb.query(
      `
      UPDATE watch_later_folders
      SET watch_later_folder_status = $1
      WHERE LOWER(watch_later_folder_name) = LOWER($2)
      AND user_id = $3
      `,
      [playlistStatus, playlist, userId],
    );

    return `Playlist "${playlist}" status changed to "${playlistStatus}"`;
  },
  {
    name: "toggle_playlist_status",
    description: "Toggle playlist status between private and public",
    schema: z.object({
      userId: z.number(),
      playlist: z.string(),
      playlistStatus: z
        .string()
        .transform((val) =>
          val.toLowerCase() === "private" ? "Private" : "Public",
        ),
    }),
  },
);

/* ===================================================
   TOOL 2: ADD MOVIE TO PLAYLIST
=================================================== */

const addMovieTool = tool(
  async ({ movie, playlist, userId }) => {
    const folder = await movieDb.query(
      `
        SELECT id
        FROM watch_later_folders
        WHERE watch_later_folder_name = $1
        AND user_id = $2
        `,
      [playlist, userId],
    );

    if (!folder.rows.length) {
      return `Playlist "${playlist}" not found`;
    }

    const movieResult = await movieDb.query(
      `
        SELECT id
        FROM movies
        WHERE LOWER(title)
        LIKE '%' || LOWER($1) || '%'
        `,
      [movie],
    );

    if (!movieResult.rows.length) {
      return `Movie "${movie}" not found`;
    }

    await movieDb.query(
      `
      INSERT INTO watch_later_files
      (
        user_id,
        folder_id,
        movie_id,
        added_at,
        folder_name,
        movie_name
      )
      VALUES
      (
        $1,
        $2,
        $3,
        NOW(),
        $4,
        $5
      )
      `,
      [userId, folder.rows[0].id, movieResult.rows[0].id, playlist, movie],
    );

    return `Movie "${movie}" added to "${playlist}"`;
  },
  {
    name: "add_movie_to_playlist",
    description: "Add a movie into a playlist",

    schema: z.object({
      movie: z.string(),
      playlist: z.string(),
      userId: z.number(),
    }),
  },
);

/* ===================================================
   TOOL 3: REMOVE MOVIE
=================================================== */

const removeMovieTool = tool(
  async ({ movie, playlist, userId }) => {
    const folder = await movieDb.query(
      `
        SELECT id
        FROM watch_later_folders
        WHERE watch_later_folder_name = $1
        AND user_id = $2
        `,
      [playlist, userId],
    );

    if (!folder.rows.length) {
      return `Playlist "${playlist}" not found`;
    }

    await movieDb.query(
      `
      DELETE FROM watch_later_files
      WHERE folder_id = $1
      AND movie_name = $2
      AND user_id = $3
      `,
      [folder.rows[0].id, movie, userId],
    );

    return `Movie "${movie}" removed from "${playlist}"`;
  },
  {
    name: "remove_movie",
    description: "Remove a movie from a playlist",

    schema: z.object({
      movie: z.string(),
      playlist: z.string(),
      userId: z.number(),
    }),
  },
);

/* ===================================================
   TOOL 4: ADD TOP MOVIES BY GENRE
=================================================== */

const addTopMoviesTool = tool(
  async ({ genre, count, playlist, userId }) => {
    const movies = await movieDb.query(
      `
        SELECT id, title
        FROM movies
        WHERE LOWER(genre)
        LIKE '%' || LOWER($1) || '%'
        LIMIT $2
        `,
      [genre, count],
    );

    if (!movies.rows.length) {
      return `No movies found`;
    }

    const folder = await movieDb.query(
      `
        SELECT id
        FROM watch_later_folders
        WHERE watch_later_folder_name = $1
        AND user_id = $2
        `,
      [playlist, userId],
    );

    if (!folder.rows.length) {
      return `Playlist "${playlist}" not found`;
    }

    for (const movie of movies.rows) {
      await movieDb.query(
        `
        INSERT INTO watch_later_files
        (
          user_id,
          folder_id,
          movie_id,
          added_at,
          folder_name,
          movie_name
        )
        VALUES
        (
          $1,
          $2,
          $3,
          NOW(),
          $4,
          $5
        )
        `,
        [userId, folder.rows[0].id, movie.id, playlist, movie.title],
      );
    }

    return `Added top ${count} ${genre} movies to "${playlist}"`;
  },
  {
    name: "add_top_movies",
    description: "Add top movies by genre into playlist",

    schema: z.object({
      genre: z.string(),
      count: z.number(),
      playlist: z.string(),
      userId: z.number(),
    }),
  },
);

/* ===================================================
   TOOLS ARRAY
=================================================== */

const tools = [
  createPlaylistTool,
  addMovieTool,
  removeMovieTool,
  addTopMoviesTool,
  togglePlaylistStatusTool,
];

/* ===================================================
   AGENT
=================================================== */

const agent = createAgent({
  model: llm,

  tools,

  systemPrompt: `
You are an AI movie playlist assistant.

Rules:

1. Always use tools for playlist operations.
2. Understand natural language.
3. Understand synonyms:
   - playlist
   - folder
   - collection
   - list
   - folder status and its synonyms:
   - private
   - public
4. Extract movie names.
5. Extract genres.
6. Handle multiple actions.
7. Extract playlist status change intent.
`,
});

/* 
   CONTROLLER
=================================================== */

export const getAiHelp = async (req, res) => {
  try {
    const { command } = req.body;
    const userId = req.user.id;

    if (!command?.trim()) {
      return res.status(400).json({
        error: "Command required",
      });
    }

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `
User ID: ${userId}

Command:
${command}
          `,
        },
      ],
    });

    /* Extract final AI response */

    const finalResponse =
      result.messages[result.messages.length - 1]?.content || "";

    /* Save memory */

    await movieDb.query(
      `
      INSERT INTO user_ai_assistant_memory
      (
        user_id,
        query,
        response,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        NOW()
      )
      `,
      [userId, command, finalResponse],
    );

    return res.status(200).json({
      response: finalResponse,
    });
  } catch (err) {
    console.error("AI Assistant Error:", err.message);

    return res.status(500).json({
      error: "Error processing AI request",
    });
  }
};
