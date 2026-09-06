import express from "express";
import { testFastAPI } from "../controllers/ai-service-test.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const router = express.Router();

router.post("/test-fastapi", authMiddleware, testFastAPI);

export default router;
