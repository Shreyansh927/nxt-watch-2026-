import express from "express";
import { testVectorSearch } from "../controllers/ai-service-test.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const router = express.Router();

router.post("/test-vector-search", authMiddleware, testVectorSearch);

export default router;
