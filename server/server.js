import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initMovieDB } from "./config/movieDB.js";
import movieRouter from "./routes/movieRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleWare.js";
import watchHistoryRouter from "./routes/watch-history-routes.js";
import watchLaterRouter from "./routes/watch-later-routes.js";
import likeDislikeRouter from "./routes/likes-dislikes-routes.js";
import commentRouter from "./routes/comment-routes.js";

const app = express();

/* ---------- CORE ---------- */
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  }),
);

app.use("/api", authRouter);

app.use("/api", movieRouter);

app.use("/api", authMiddleware, watchHistoryRouter);

app.use("/api", authMiddleware, watchLaterRouter);

app.use("/api", authMiddleware, likeDislikeRouter);

app.use("/api", authMiddleware, commentRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
initMovieDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
