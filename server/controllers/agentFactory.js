import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";

export const createFallbackAgent = (tools, systemPrompt) => {
  const geminiAgent = createAgent({
    model: new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      apiKey: process.env.GEMINI_API_KEY,
    }),
    tools,
    systemPrompt,
  });

  const groqAgent = createAgent({
    model: new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY,
    }),
    tools,
    systemPrompt,
  });

  return {
    invoke: async (payload) => {
      try {
        return await geminiAgent.invoke(payload);
      } catch (error) {
        console.error("Gemini agent failed:", error.message);

        return await groqAgent.invoke(payload);
      }
    },
  };
};
