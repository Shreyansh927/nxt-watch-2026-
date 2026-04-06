import express from "express";
import {
  fetchAnimes,
  fetchDocumentries,
  fetchMovieById,
  fetchMovies,
  fetchTvShows,
  searchMovies,
} from "../controllers/fetchMovies.js";
import { syncTmdbWithMyMovieDB } from "../controllers/syncTmdbWithMyMovieDB.js";
import { recommendMovies, vectorSearch } from "../controllers/vector-search.js";
import { getCurrentUser } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
import { aiLimiter } from "../middlewares/rate-limiter.js";

const movieRouter = express.Router();
movieRouter.post("/sync-tmdb", async (req, res) => {
  try {
    await syncTmdbWithMyMovieDB();
    res.status(200).json({ message: "TMDB sync completed" });
  } catch (err) {
    console.error("Error syncing TMDB:", err);
    res.status(500).json({ error: "Failed to sync TMDB" });
  }
});
movieRouter.get("/sync-tmdb", async (req, res) => {
  try {
    await syncTmdbWithMyMovieDB();
    res.status(200).json({ message: "TMDB sync completed" });
  } catch (err) {
    console.error("Error syncing TMDB:", err);
    res.status(500).json({ error: "Failed to sync TMDB" });
  }
});

movieRouter.get("/get-movie/:movieId", fetchMovieById);
movieRouter.get("/discover-movies", fetchMovies);
movieRouter.get("/discover-documetries", fetchDocumentries);
movieRouter.get("/discover-animes", fetchAnimes);
movieRouter.get("/discover-tv", fetchTvShows);
movieRouter.get("/search-movies", searchMovies);
movieRouter.get("/vector-search", authMiddleware, aiLimiter, vectorSearch);
movieRouter.get("/recommendations", authMiddleware, recommendMovies);

export default movieRouter;
