import express from "express";
import { signUp, login, logout, getCurrentUser } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", getCurrentUser);

export default authRouter;
