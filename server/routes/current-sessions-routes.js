import express from "express";
import { currentSessions } from "../controllers/current-sessions.js";

const currentSessionsRouter = express.Router();

currentSessionsRouter.get("/all-current-sessions", currentSessions);

export default currentSessionsRouter;
