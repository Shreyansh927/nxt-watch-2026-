import express from "express";
import { fetchMovieById, fetchMovies } from "../controllers/fetchMovies.js";
import { syncTmdbWithMyMovieDB } from "../controllers/syncTmdbWithMyMovieDB.js";

const movieRouter = express.Router();
movieRouter.post("/sync-tmdb", async (req, res) => {
  try {
    await syncTmdbWithMyMovieDB(100);
    res.status(200).json({ message: "TMDB sync completed" });
  } catch (err) {
    console.error("Error syncing TMDB:", err);
    res.status(500).json({ error: "Failed to sync TMDB" });
  }
});
movieRouter.get("/sync-tmdb", async (req, res) => {
  try {
    await syncTmdbWithMyMovieDB(100);
    res.status(200).json({ message: "TMDB sync completed" });
  } catch (err) {
    console.error("Error syncing TMDB:", err);
    res.status(500).json({ error: "Failed to sync TMDB" });
  }
});
movieRouter.get("/get-movie/:movieId", fetchMovieById);
movieRouter.get("/", fetchMovies);
export default movieRouter;
