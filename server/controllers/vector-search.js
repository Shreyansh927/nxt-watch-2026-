import { movieDb } from "../config/movieDB.js";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Generate Embedding from Gemini

const queryEmbedding = async (text) => {
  try {
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });

    const rawEmbedding = result.embeddings?.[0]?.values;
    console.log("Raw embedding:", rawEmbedding);
    if (!rawEmbedding) return null;
    return `[${rawEmbedding.map(Number).join(",")}]`;
  } catch (err) {
    console.error("Gemini embedding failed:", err);
    return null;
  }
};

export const recommendMovies = async (req, res) => {
  const userId = req.user?.id;
  try {
    const userWatchHistoryEffect = await movieDb.query(
      `SELECT AVG(vector_embedding) AS user_pref_vector FROM watch_history WHERE user_id = $1`,
      [userId],
    );

    const userLikedMovieEmbeddings = await movieDb.query(
      `SELECT AVG(movies.vector_embedding) as liked_movies_pref_vector FROM likes INNER JOIN movies ON likes.movie_id = movies.id WHERE likes.user_id = $1`,
      [userId],
    );

    const userPrefVec = userWatchHistoryEffect.rows[0]?.user_pref_vector;
    const likedMoviesPrefVec =
      userLikedMovieEmbeddings.rows[0]?.liked_movies_pref_vector;

    if (!userPrefVec) {
      return res.status(200).json({ results: [] });
    }

    const recommendationResult = await movieDb.query(
      `SELECT id, title, posterpath, backdroppath, release_year, movielink, (1 - (vector_embedding <-> $1)) * 100 AS match_percent FROM movies WHERE vector_embedding IS NOT NULL ORDER BY (vector_embedding <-> $2)*0.5 + (vector_embedding <-> $3)*0.5 LIMIT 10 OFFSET 30`,
      [userPrefVec, userPrefVec, likedMoviesPrefVec],
    );

    console.log("Recommendation result:", recommendationResult.rows);

    return res.status(200).json({ results: recommendationResult.rows });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return res.status(500).json({ error: "Error fetching recommendations" });
  }
};

/* ---------------------------------------------------
   Hybrid Vector Search (Semantic + Personalized)
--------------------------------------------------- */
export const vectorSearch = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    // Generate query embedding
    const queryVec = await queryEmbedding(query);

    const personalizedQueryVec = await queryEmbedding(
      `suggest movies like: ${query} not based on plot but based on overall vibe and themes. I liked ${query} because of ... `,
    );

    const trendingQueryVec = await queryEmbedding(
      `suggest movies like: ${query} that are currently trending and popular among audiences`,
    );

    if (!queryVec) {
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    let rows;

    // If user logged in → fetch preference vector
    if (userId) {
      const prefResult = await movieDb.query(
        `
        SELECT AVG(vector_embedding) AS pref_vector
        FROM watch_history
        WHERE user_id = $1
        `,
        [userId],
      );

      const userPrefVec = prefResult.rows[0]?.pref_vector;

      // 3️⃣ Hybrid Ranking (Weighted Distance)
      if (userPrefVec) {
        const result = await movieDb.query(
          `
          SELECT 
            id, 
            title, 
            posterpath, 
            backdroppath, 
            release_year,
            (
      1 - (
        
        vector_embedding <-> $1
      )
    ) * 100 AS match_percent
          FROM movies
          WHERE vector_embedding IS NOT NULL
          ORDER BY 
            (vector_embedding <-> $2) * 0.7 +
            (vector_embedding <-> $3) * 0.3
          LIMIT 12
          `,
          [userPrefVec, queryVec, userPrefVec],
        );

        rows = result.rows;
      } else {
        // No watch history yet → semantic only
        const result = await movieDb.query(
          `
          SELECT 
            id, 
            title, 
            posterpath, 
            backdroppath, 
            release_year
          FROM movies
          WHERE vector_embedding IS NOT NULL
          ORDER BY vector_embedding <-> $1
          LIMIT 10
          `,
          [queryVec],
        );

        rows = result.rows;
      }
    } else {
      // Guest user → semantic search only
      const result = await movieDb.query(
        `
        SELECT 
          id, 
          title, 
          posterpath, 
          backdroppath, 
          release_year
        FROM movies
        WHERE vector_embedding IS NOT NULL
        ORDER BY vector_embedding <-> $1
        LIMIT 10
        `,
        [queryVec],
      );

      rows = result.rows;
    }

    const personalizedResults = await movieDb.query(
      `SELECT id, title, posterpath, backdroppath, release_year, (1 - (vector_embedding <-> $1)) * 100 AS match_percent FROM movies WHERE vector_embedding IS NOT NULL ORDER BY vector_embedding <-> $1 LIMIT 12 OFFSET 12`,
      [personalizedQueryVec],
    );

    const trendingResults = await movieDb.query(
      `SELECT id, title, posterpath, backdroppath, release_year, (1 - (vector_embedding <-> $1)) * 100 AS match_percent FROM movies WHERE vector_embedding IS NOT NULL ORDER BY vector_embedding <-> $1 LIMIT 12`,
      [trendingQueryVec],
    );
    console.log(rows);
    console.log("Personalized results:", personalizedResults?.rows);
    console.log("Trending results:", trendingResults?.rows);
    return res.status(200).json({
      results: rows,
      similar_results: personalizedResults?.rows || [],
      trending_results: trendingResults?.rows || [],
    });
  } catch (err) {
    console.error("VECTOR SEARCH ERROR:", err);
    return res.status(500).json({ error: "Error performing vector search" });
  }
};
