import express from "express";
import {
  signUp,
  login,
  logout,
  getCurrentUser,
  allCurrentSessions,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
// import { deviceLimitMiddleware } from "../middlewares/device-limit.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/me", authMiddleware, getCurrentUser);
authRouter.get("/all-current-sessions", allCurrentSessions);

export default authRouter;
