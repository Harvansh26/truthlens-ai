import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  analyzeContent,
  getAnalysisHistory
} from "../controllers/analysisController.js";

const router = express.Router();

router.post("/", authMiddleware, analyzeContent);
router.get("/history", authMiddleware, getAnalysisHistory);

export default router;