import { callAIService, callVectorSearchService } from "../utils/ai-service.js";


export const testFastAPI = async (req, res) => {
  try {
    const { message } = req.body;

    const result = await callAIService("/api/ai/chat", {
      message,
    });

    console.log("========== FASTAPI RESPONSE ==========");
    console.log(result);
    console.log("======================================");

    return res.status(200).json({
      success: true,
      handledBy: "FastAPI",
      ...result,
    });
  } catch (error) {
    console.error(
      "FastAPI request failed:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      error: "FastAPI AI service unavailable",
      details: error.response?.data || error.message,
    });
  }
};



export const testVectorSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    console.log("Sending query to FastAPI:", query);

    const result = await callVectorSearchService(query);

    console.log("========== FASTAPI VECTOR RESPONSE ==========");
    console.log(result);
    console.log("=============================================");

    return res.status(200).json({
      success: true,
      handledBy: "FastAPI",
      query,
      ...result,
    });
  } catch (error) {
    console.error(
      "FastAPI vector search failed:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      error: "FastAPI vector search unavailable",
      details: error.response?.data || error.message,
    });
  }
};