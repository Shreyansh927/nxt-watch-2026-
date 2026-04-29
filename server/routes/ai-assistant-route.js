import { getAiHelp } from "../controllers/ai-assistant.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

import express from "express";

const aiAssistantRouter = express.Router();

aiAssistantRouter.post("/command", authMiddleware, getAiHelp);

export default aiAssistantRouter;
