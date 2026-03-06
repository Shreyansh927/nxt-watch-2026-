import dotenv from "dotenv";
dotenv.config();
import { movieDb } from "../config/movieDB.js";

export const fetchMovies = async (req, res) => {
  try {
    const { with_genres, page } = req.query;

    const pageNumber = parseInt(page, 10);
    const safePage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
    const offset = (safePage - 1) * 20;

    const result = await movieDb.query(
      `
  SELECT * FROM movies
  WHERE ($1::text IS NULL OR genre LIKE '%' || $1::text || '%')
  LIMIT 20 OFFSET $2
  `,
      [with_genres, offset],
    );

    return res.status(200).json({ movies: result.rows });
  } catch (err) {
    console.error("FETCH MOVIES ERROR:", err);
    return res.status(500).json({ error: "Error fetching movies" });
  }
};

export const fetchDocumentries = async (req, res) => {
  try {
    const result = await movieDb.query(
      `
        SELECT * FROM movies
        WHERE genre LIKE '%99%'
        LIMIT 20 OFFSET 1
        `,
    );

    return res.status(200).json({ movies: result.rows });
  } catch (err) {
    console.error("FETCH DOCUMENTRIES ERROR:", err);
    return res.status(500).json({ error: "Error fetching documentries" });
  }
};

export const fetchAnimes = async (req, res) => {
  try {
    const result = await movieDb.query(
      `SELECT * FROM movies WHERE genre LIKE '%16%' LIMIT 20 OFFSET 1`,
    );
    return res.status(200).json({ movies: result.rows });
  } catch (err) {
    console.error("FETCH ANIMES ERROR:", err);
    return res.status(500).json({ error: "Error fetching animes" });
  }
};

export const fetchTvShows = async (req, res) => {
  try {
    const result = await movieDb.query(
      `SELECT * FROM movies WHERE genre LIKE '%10770%' LIMIT 20 OFFSET 1`,
    );
    return res.status(200).json({ movies: result.rows });
  } catch (err) {
    console.error("FETCH TV SHOWS ERROR:", err);
    return res.status(500).json({ error: "Error fetching tv shows" });
  }
};

export const fetchMovieById = async (req, res) => {
  const { movieId } = req.params;
  try {
    const result = await movieDb.query(`SELECT * FROM movies WHERE id=$1`, [
      movieId,
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Movie not found" });
    }
    return res.status(200).json({ movie: result.rows[0] });
  } catch (err) {
    console.error("FETCH MOVIE BY ID ERROR:", err);
    return res.status(500).json({ error: "Error fetching movie details" });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const { search } = req.query;

    const result = await movieDb.query(
      `
        SELECT * FROM movies
      WHERE title ILIKE '%' || $1::text || '%'

     `,
      [search],
    );
    return res.status(200).json({ movies: result.rows });
  } catch (err) {
    console.error("SEARCH MOVIES ERROR:", err);
    return res.status(500).json({ error: "Error searching movies" });
  }
};
