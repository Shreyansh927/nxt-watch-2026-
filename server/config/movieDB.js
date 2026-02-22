import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";

const { Pool } = pkg;

export const movieDb = new Pool({
  connectionString: process.env.MOVIE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export const initMovieDB = async () => {
  await movieDb.query(`CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title TEXT,
  description TEXT,
  release_year INTEGER,
  genre TEXT,
  imdb_id TEXT,
  movielink TEXT

);
    `);
};
