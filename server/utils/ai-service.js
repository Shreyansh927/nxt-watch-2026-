import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export const callAIService = async (message) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat`, {
    message,
  });

  return response.data;
};

export const callVectorSearchService = async (query) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/vector-search`, {
    query,
  });

  return response.data;
};