import express from "express";

import {
  generateSummary,
  uploadMovie,
} from "../controllers/admin-panel-controls.js";

const adminPanelRouter = express.Router();

adminPanelRouter.post("/generate-summary", generateSummary);
adminPanelRouter.post("/admin/upload-movie", uploadMovie);

export default adminPanelRouter;
