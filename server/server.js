import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { initMovieDB } from "./config/movieDB.js";
import movieRouter from "./routes/movieRoutes.js";
import authRouter from "./routes/authRoutes.js";
import {
  accessTokenGeneration,
  authMiddleware,
} from "./middlewares/authMiddleWare.js";
import watchHistoryRouter from "./routes/watch-history-routes.js";
import watchLaterRouter from "./routes/watch-later-routes.js";
import likeDislikeRouter from "./routes/likes-dislikes-routes.js";
import commentRouter from "./routes/comment-routes.js";
import aiMovieRouter from "./routes/ai-movie-chat-session-routes.js";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import profileRouter from "./routes/profile-router.js";

const app = express();
app.use(helmet());

/* ---------- CORE ---------- */
app.set("trust proxy", 1);
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.get("/api/access-token-generation", accessTokenGeneration);

app.use("/api", authRouter);

app.use("/api", movieRouter);

app.use("/api", authMiddleware, watchHistoryRouter);

app.use("/api", authMiddleware, watchLaterRouter);

app.use("/api", authMiddleware, likeDislikeRouter);

app.use("/api", authMiddleware, commentRouter);

app.use("/api", authMiddleware, aiMovieRouter);

app.use('/api',authMiddleware, profileRouter)

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

const PORT = process.env.PORT || 5000;
initMovieDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
