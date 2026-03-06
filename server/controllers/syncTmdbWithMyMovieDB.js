import { movieDb } from "../config/movieDB.js";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Free tier safe settings
const BATCH_SIZE = 3; // small parallelism
const BATCH_DELAY_MS = 1500; // delay between batches
const LIMIT_PER_RUN = 300; // process max 60 movies per run

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ============================================
   Generate Embedding with Retry
============================================ */
const generateEmbedding = async (text, retries = 3) => {
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

    // 🔥 Force numeric conversion
    const embedding = rawEmbedding.map((v) => Number(v));

    // Optional safety check
    if (embedding.some((v) => Number.isNaN(v))) {
      console.error("Invalid embedding values detected");
      return null;
    }

    return [embedding.join(",")];
  } catch (err) {
    const errorData = err?.error || err;

    if (errorData?.status === "RESOURCE_EXHAUSTED" && retries > 0) {
      const retryDelay =
        parseInt(
          errorData?.details
            ?.find(
              (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo",
            )
            ?.retryDelay?.replace("s", ""),
        ) || 60;

      console.log(`⚠️ Rate limit hit. Retrying in ${retryDelay}s...`);
      await sleep(retryDelay * 1000);

      return generateEmbedding(text, retries - 1);
    }

    console.error("Gemini embedding failed:", errorData);
    return null;
  }
};

/* ============================================
   Sync Movies Gradually (Free Tier Friendly)
============================================ */
export const syncTmdbWithMyMovieDB = async () => {
  try {
    console.log("Starting embedding sync...");

    const moviesRes = await movieDb.query(`
      SELECT tmdb_id, imdb_id, title, description, genre,
             director, actors, writers, box_office, country
      FROM movies
      WHERE vector_embedding IS NULL
      ORDER BY id ASC
      LIMIT ${LIMIT_PER_RUN}
    `);

    const movies = moviesRes.rows;

    if (!movies.length) {
      console.log("No movies require embedding.");
      return;
    }

    console.log(`Processing ${movies.length} movies this run...`);

    let successCount = 0;

    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
      const batch = movies.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (movie) => {
          try {
            const textToEmbed = `
              Title: ${movie.title || ""}
              Description: ${movie.description || ""}
              Genre: ${movie.genre || ""}
              Director: ${movie.director || ""}
              Actors: ${movie.actors || ""}
              Country: ${movie.country || ""}
            `;

            const embedding = await generateEmbedding(textToEmbed);

            if (!embedding) return;
            const vectorString = `[${embedding.join(",")}]`;

            await movieDb.query(
              `UPDATE movies
   SET vector_embedding = $1
   WHERE tmdb_id = $2
   AND vector_embedding IS NULL`,
              [vectorString, movie.tmdb_id],
            );

            successCount++;
            console.log(`✅ Updated: ${movie.title}`);
          } catch (err) {
            console.error(`❌ Failed for ${movie.title}:`, err.message);
          }
        }),
      );

      // delay between batches to avoid burst
      await sleep(BATCH_DELAY_MS);
    }

    console.log(
      `🎉 Sync finished. Successfully embedded ${successCount} movies.`,
    );
  } catch (err) {
    console.error("SYNC ERROR:", err.message);
  }
};
