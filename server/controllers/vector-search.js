import { movieDb } from "../config/movieDB.js";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ---------------------------------------------------
   Generate Embedding from Gemini
--------------------------------------------------- */
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

    if (!rawEmbedding) return null;

    // Convert to pgvector format: [0.123,0.456,...]
    return `[${rawEmbedding.map(Number).join(",")}]`;
  } catch (err) {
    console.error("Gemini embedding failed:", err);
    return null;
  }
};

/* ---------------------------------------------------
   Hybrid Vector Search (Semantic + Personalized)
--------------------------------------------------- */
export const vectorSearch = async (req, res) => {
  try {
    const userId = req.user?.id; // Safe access
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    // 1️⃣ Generate query embedding
    const queryVec = await queryEmbedding(query);

    if (!queryVec) {
      return res.status(500).json({ error: "Embedding generation failed" });
    }

    let rows;

    // 2️⃣ If user logged in → fetch preference vector
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
          LIMIT 10
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
    console.log(rows);
    return res.status(200).json({ results: rows });
  } catch (err) {
    console.error("VECTOR SEARCH ERROR:", err);
    return res.status(500).json({ error: "Error performing vector search" });
  }
};
