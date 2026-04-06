import express from "express";
import {
  aiResponse,
  fetchAiMovieChats,
} from "../controllers/ai-movie-chat-session.js";

const aiMovieRouter = express.Router();

aiMovieRouter.post("/ai-movie-query", aiResponse);
aiMovieRouter.get("/fetch-ai-movie-chats/:movieId", fetchAiMovieChats);

export default aiMovieRouter;
