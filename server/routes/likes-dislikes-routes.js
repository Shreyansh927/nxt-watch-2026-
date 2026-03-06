import express from "express";
import {
  dislikeMovie,
  fetchAllMoviedislikeCount,
  fetchAllMovieLikeCount,
  likeMovie,
} from "../controllers/like-dislike.js";

const likeDislikeRouter = express.Router();

likeDislikeRouter.post("/like/:movieId", likeMovie);
likeDislikeRouter.post("/dislike/:movieId", dislikeMovie);
likeDislikeRouter.get(
  "/get-movie-likes-count/:movieId",
  fetchAllMovieLikeCount,
);
likeDislikeRouter.get(
  "/get-movie-dislikes-count/:movieId",
  fetchAllMoviedislikeCount,
);

export default likeDislikeRouter;
