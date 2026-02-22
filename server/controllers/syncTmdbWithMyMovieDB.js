import { movieDb } from "../config/movieDB.js";

export const syncTmdbWithMyMovieDB = async (pages = 100) => {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  try {
    for (let page = 1; page <= pages; page++) {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=${page}`,
      );

      const data = await response.json();

      for (const movie of data.results) {
        const detailRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`,
        );

        const detailData = await detailRes.json();

        const imdbId = detailData.imdb_id;

        await movieDb.query(
          `INSERT INTO movies 
     (tmdb_id, title, description, release_year, genre, imdb_id, movielink)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tmdb_id) DO NOTHING`,
          [
            movie.id,
            movie.title,
            movie.overview,
            movie.release_date
              ? parseInt(movie.release_date.split("-")[0])
              : null,
            movie.genre_ids.join(","),
            imdbId,
            imdbId ? `https://vsembed.ru/embed/movie/${imdbId}` : null,
          ],
        );

        console.log(`Inserted movie: ${movie.title}`);
      }
      console.log(`Page ${page} synced successfully!`);
    }
  } catch (err) {
    console.error("SYNC TMDB ERROR:", err);
  }
};
