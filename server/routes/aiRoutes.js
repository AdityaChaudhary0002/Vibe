import express from "express";
import { upload } from "../configs/multer.js"; // Reuse existing multer config
import { transcribeAudio, translateText } from "../controllers/aiController.js";
import { protect } from "../middlewares/auth.js"; // Optional: protect AI routes? Yes.

const aiRouter = express.Router();

aiRouter.post("/transcribe", protect, upload.single("audio"), transcribeAudio);
aiRouter.post("/translate", protect, translateText);

export default aiRouter;
