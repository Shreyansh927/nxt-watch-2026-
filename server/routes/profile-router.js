import express from "express";
import { updateProfile } from "../controllers/profile.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
import { upload } from "../utils/multer.js";

const profileRouter = express.Router();

profileRouter.put(
  "/update-profile",
  
  upload.single("profile_image"),
  updateProfile,
);

export default profileRouter;
