import { movieDb } from "../config/movieDB.js";
import { GoogleGenAI } from "@google/genai";
import { redis } from "../utils/redis-client.js";
import crypto from "crypto";
import { request } from "http";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const CACHE_TTL = 300;

/* ---------------- EMBEDDING GENERATION ---------------- */

const generateEmbedding = async (text) => {
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

    const embedding = rawEmbedding.map((v) => Number(v));

    if (embedding.some((v) => Number.isNaN(v))) {
      console.error("Invalid embedding values detected");
      return null;
    }

    return embedding;
  } catch (err) {
    console.log(err);
  }
};

/* ---------------- LLM RESPONSE ---------------- */

const generateResponse = async (q, context = "") => {
  try {
    const prompt = `
Use the following previous context if relevant:

${context}

Question:
${q}

Answer in 3 concise sentences.
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
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

/* ---------------- MAIN CONTROLLER ---------------- */

export const aiResponse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, question } = req.body;

    /* ---------- HASH QUESTION ---------- */

    const hashedQuestion = crypto
      .createHash("sha256")
      .update(question)
      .digest("hex");

    const cacheKey = `rag:response:${hashedQuestion}`;

    /* ---------- REDIS CACHE CHECK ---------- */

    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      console.log("CACHE HIT");

      return res.status(200).json({
        source: "cache",
        response: JSON.parse(cachedResponse),
      });
    }

    /* ---------- GENERATE EMBEDDING ---------- */

    const queryEmbedding = await generateEmbedding(question);

    if (!queryEmbedding) {
      return res.status(500).json({ message: "Embedding generation failed" });
    }

    const vectorEmbedding = `[${queryEmbedding.join(",")}]`;

    /* ---------- VECTOR SEARCH ---------- */

    const similarMessages = await movieDb.query(
      `
      SELECT query, response,
      query_embedding <-> $1::vector AS distance
      FROM messages
      ORDER BY distance
      LIMIT 3
      `,
      [vectorEmbedding],
    );

    console.log("Vector results:", similarMessages.rows);

    /* ---------- IF SIMILAR QUESTION FOUND ---------- */

    if (similarMessages.rows.length > 0) {
      const bestMatch = similarMessages.rows[0];

      if (bestMatch.distance < 0.15) {
        console.log("Semantic cache hit:", bestMatch.distance);

        return res.status(200).json({
          source: "semantic-cache",
          distance: bestMatch.distance,
          query: bestMatch.query,
          response: bestMatch.response,
        });
      }
    }

    /* ---------- CREATE / GET SESSION ---------- */

    const result = await movieDb.query(
      `SELECT * FROM chat_sessions WHERE user_id = $1 AND movie_id = $2`,
      [userId, movieId],
    );

    let sessionId;

    if (!result.rows.length) {
      const newSession = await movieDb.query(
        `INSERT INTO chat_sessions (user_id, movie_id)
         VALUES ($1,$2)
         RETURNING id`,
        [userId, movieId],
      );

      sessionId = newSession.rows[0].id;
    } else {
      sessionId = result.rows[0].id;
    }

    /* ---------- BUILD CONTEXT FROM SIMILAR QUESTIONS ---------- */

    let context = "";

    if (similarMessages.rows.length > 0) {
      context = similarMessages.rows
        .map((m) => `Q: ${m.query}\nA: ${m.response}`)
        .join("\n\n");
    }

    /* ---------- GENERATE LLM RESPONSE ---------- */

    const queryResponse = await generateResponse(question, context);

    /* ---------- STORE MESSAGE ---------- */

    await movieDb.query(
      `
      INSERT INTO messages
      (session_id, query, query_embedding, created_at, response)
      VALUES ($1,$2,$3::vector,NOW(),$4)
      `,
      [sessionId, question, vectorEmbedding, queryResponse],
    );

    /* ---------- CACHE RESPONSE ---------- */

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(queryResponse));

    return res.status(200).json({
      source: "llm",
      response: queryResponse,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

export const fetchAiMovieChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const { rows } = await movieDb.query(
      `SELECT * from chat_sessions where movie_id = $1 AND user_id = $2`,
      [movieId, userId],
    );
    const currentSessionId = rows[0].id;
    const result = await movieDb.query(
      `SELECT query as query , response as response from messages where session_id = $1`,
      [currentSessionId],
    );
    return res.status(200).json({ result: result.rows });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ message: err });
  }
};
