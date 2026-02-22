import dotenv from "dotenv";
dotenv.config();
import { movieDb } from "../config/movieDB.js";

export const fetchMovies = async (req, res) => {
  try {
    const result = await movieDb.query("SELECT * FROM movies");
    return res.status(200).json({ movies: result.rows });
  } catch (err) {
    console.error("FETCH MOVIES ERROR:", err);
    return res.status(500).json({ error: "Error fetching movies" });
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
