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
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  tmdb_id INTEGER UNIQUE,
  title TEXT,
  posterPath TEXT,
  backdropPath TEXT,
  description TEXT,
  release_year INTEGER,
  genre TEXT,
  imdb_id TEXT,
  movielink TEXT,
  director TEXT,
  actors TEXT,
  writers TEXT,
  box_office TEXT,
  country TEXT,
  vector_embedding vector(3072) --pgvector column for AI search
);`);

  await movieDb.query(`
  CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  public_id TEXT,
  name TEXT,
  email TEXT,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW() );`);

  await movieDb.query(`CREATE TABLE IF NOT EXISTS watch_history(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    watched_at TIMESTAMP DEFAULT NOW(),
    vector_embedding vector(3072)
  );`);

  await movieDb.query(`CREATE TABLE IF NOT EXISTS watch_later_folders(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    watch_later_folder_name TEXT,
    watch_later_folder_status TEXT,
    created_at TIMESTAMP DEFAULT NOW() 
    )`);

  await movieDb.query(`CREATE TABLE IF NOT EXISTS watch_later_files(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    folder_id INTEGER,
    FOREIGN KEY (folder_id) REFERENCES watch_later_folders(id) ON DELETE CASCADE,
    movie_id INTEGER,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    folder_name TEXT, 
    FOREIGN KEY (folder_name) REFERENCES watch_later_folders(watch_later_folder_name) ON DELETE CASCADE,
    movie_name TEXT,
    FOREIGN KEY (movie_name) REFERENCES movies(title) ON DELETE CASCADE
    )`);

  await movieDb.query(`CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,

  UNIQUE (user_id, movie_id)

      )`);
  await movieDb.query(`CREATE TABLE IF NOT EXISTS dislikes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE (user_id, movie_id)
    )`);

  await movieDb.query(`CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    movie_id INTEGER NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    content TEXT
    )`);
};
