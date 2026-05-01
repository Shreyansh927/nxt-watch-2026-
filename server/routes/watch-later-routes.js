import express from "express";
import {
  addMovieToWatchLaterFile,
  addWatchLaterFolder,
  fetchAllWatchLaterFolders,
  getAllWatchLaterFolderFiles,
  getWatchLaterPublicPlaylistsWithPublicId,
  updateWatchLaterFolder,
} from "../controllers/watch-later.js";

const watchLaterRouter = express.Router();

watchLaterRouter.post("/add-to-watch-later", addWatchLaterFolder);

watchLaterRouter.get("/get-watch-later-folders", fetchAllWatchLaterFolders);

watchLaterRouter.put("/update-watch-later-folder", updateWatchLaterFolder);

watchLaterRouter.post("/add-to-watch-later-folder", addMovieToWatchLaterFile);

watchLaterRouter.get(
  "/get-watch-later-folder-files/:folderId",
  getAllWatchLaterFolderFiles,
);

watchLaterRouter.get(
  "/get-public-playlists/:publicId",
  getWatchLaterPublicPlaylistsWithPublicId,
);

export default watchLaterRouter;
