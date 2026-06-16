import { movieDb } from "../config/movieDB.js";

import { z } from "zod";

import { ca } from "zod/v4/locales";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

const genAi = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY,
});

const genAiEmbedding = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateSummary = async (req, res) => {
  try {
    const { movieLink } = req.body;

    if (!movieLink) {
      return res.status(400).json({ error: "Movie link is required" });
    }
    const response = await genAi.invoke(
      `Summarize the following movie in 3-4 sentences: ${movieLink}, also include movie name , and every important details about the movie in the summary. Make sure to include the movie name in the summary. If you cannot access the link, provide a generic summary based on the movie name.`,
    );

    console.log("Gemini response:", response);

    return res.status(200).json({ summary: response.text });
  } catch (err) {
    console.error("Error generating summary:", err);
    return res.status(500).json({ error: "Failed to generate summary" });
  }
};

export const generateEmbedding = async (movieName, description) => {
  try {
    const combinedText = `${movieName}: ${description}`;
    const embeddingResponse = await genAiEmbedding.embedQuery(combinedText);

    console.log("Gemini embedding response:", embeddingResponse);

    // if (!embedding) {
    //   console.error("No embedding returned from Gemini");
    //   return null;
    // }
    return `[${embeddingResponse.join(",")}]`;
  } catch (err) {
    console.error("Error generating embedding:", err);
    return null;
  }
};

export const uploadMovie = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      tmdbID,
      description,
      release_year,
      genre,
      imdbID,
      movieLINK,
      actors,
      director,
      writers,
      box_office,
      country,
    } = req.body;

    const vectorEmbedding = await generateEmbedding(title, description);

    await movieDb.query(
      `INSERT INTO movies (title, tmdb_id, description, release_year, genre, imdb_id, movielink, actors, director, writers, box_office, country, vector_embedding) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        title,
        tmdbID,
        description,
        release_year,
        genre,
        imdbID,
        movieLINK,
        actors,
        director,
        writers,
        box_office,
        country,
        vectorEmbedding,
      ],
    );
    // console.log("Movie uploaded with embedding:", vectorEmbedding);
    console.log("Movie uploaded successfully");
    return res.status(201).json({ message: "Movie uploaded successfully" });
  } catch (err) {
    console.error("Error uploading movie:", err);
    return res.status(500).json({ error: "Failed to upload movie" });
  }
};
