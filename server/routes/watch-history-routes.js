import express from "express";
import {
  addToWatchHistory,
  deleteFullWatchHistory,
  deleteWatchhistoryVideo,
  getWatchHistory,
} from "../controllers/watch-history.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const watchHistoryRouter = express.Router();

watchHistoryRouter.post(
  "/add-to-watch-history",

  addToWatchHistory,
);

watchHistoryRouter.get("/get-watch-history", getWatchHistory);
watchHistoryRouter.delete("/delete-movie/:movieId", deleteWatchhistoryVideo);
watchHistoryRouter.delete(
  "/delete-full-watch-history",
  authMiddleware,
  deleteFullWatchHistory,
);

export default watchHistoryRouter;
