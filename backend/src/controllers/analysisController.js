import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const analyzeContent = async (req, res) => {
  try {
    const { text, contentType } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Text content is required for analysis."
      });
    }

    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, {
      text
    });

    const result = aiResponse.data;

    const savedReport = await prisma.analysisReport.create({
      data: {
        userId: req.user.id,
        inputText: text,
        contentType: contentType || "text",
        riskScore: Number(result.riskScore || 0),
        verdict: result.verdict || "Unknown",
        reasons: JSON.stringify(result.reasons || []),
        aiProbability: Number(result.aiProbability || 0)
      }
    });

    return res.status(200).json({
      message: "Content analyzed successfully.",
      result,
      reportId: savedReport.id
    });
  } catch (error) {
    console.error("Analysis error:", error?.response?.data || error.message);
    return res.status(500).json({
      message: "Failed to analyze content."
    });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const reports = await prisma.analysisReport.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const formattedReports = reports.map((report) => ({
      ...report,
      reasons: JSON.parse(report.reasons)
    }));

    return res.status(200).json(formattedReports);
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({
      message: "Failed to fetch analysis history."
    });
  }
};