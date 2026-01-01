import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "nodejs",
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prompt, context } = req.body as {
      prompt: string;
      context: string;
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const fullPrompt = `You are an AI assistant that answers questions about Imran Khan, former Prime Minister of Pakistan.
Use the following context passages from Imran Khan's speeches, tweets, and interviews to answer the user's question.

Context:
${context}

User Question: ${prompt}

Instructions:
- Provide accurate, informative answers based on the context provided
- If the answer cannot be found in the context, say so clearly
- Maintain a respectful and informative tone
- Keep answers concise but comprehensive
- Cite specific sources when relevant`;

    const result = await model.generateContentStream(fullPrompt);

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream the response
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    console.error("Answer error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate answer" });
    } else {
      res.end();
    }
  }
};

export default handler;
