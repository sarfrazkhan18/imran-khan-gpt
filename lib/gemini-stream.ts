import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function streamGeminiResponse(prompt: string, context: string) {
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

  // Create a readable stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return stream;
}
