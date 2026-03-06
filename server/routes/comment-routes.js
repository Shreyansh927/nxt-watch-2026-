import express from "express";
import { fetchAllMovieComments, postComment } from "../controllers/comments.js";

const commentRouter = express.Router();

commentRouter.post("/comment", postComment);

commentRouter.get("/get-movie-comments/:movieId", fetchAllMovieComments);
export default commentRouter;
