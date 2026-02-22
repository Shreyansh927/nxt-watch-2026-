import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initMovieDB } from "./config/movieDB.js";
import movieRouter from "./routes/movieRoutes.js";

const app = express();

/* ---------- CORE ---------- */
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5174"],
    credentials: true,
  }),
);

app.use("/api/movies", movieRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
initMovieDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
