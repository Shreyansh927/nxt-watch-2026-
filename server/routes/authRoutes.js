import express from "express";
import {
  signUp,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/me", authMiddleware, getCurrentUser);

export default authRouter;
