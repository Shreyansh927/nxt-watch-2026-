import express from "express";
import { playlistData } from "../controllers/graphs.js";

const graphRouter = express.Router();

graphRouter.get("/analytics", playlistData);



export default graphRouter;
