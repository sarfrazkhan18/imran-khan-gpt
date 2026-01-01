import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchResult } from "@/types";
import { getCollection } from "@/lib/chroma";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "nodejs",
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Simple deterministic embedding generator for fallback
const generateSimpleEmbedding = (text: string): number[] => {
  const embedding = new Array(768).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const idx = (charCode * (i + 1) + j) % 768;
      embedding[idx] += Math.sin(charCode * (i + 1)) * 0.1;
    }
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { query, matches } = req.body as {
      query: string;
      matches: number;
    };

    const input = query.replace(/\n/g, " ");

    // Generate embedding using Gemini or fallback
    let embedding: number[];

    try {
      const embeddingModel = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
      const embeddingResult = await embeddingModel.embedContent(input);
      embedding = Array.from(embeddingResult.embedding.values);
    } catch (error) {
      console.log("Using fallback embeddings for search");
      embedding = generateSimpleEmbedding(input);
    }

    // Query ChromaDB
    const collection = await getCollection();

    const queryResponse = await collection.query({
      queryEmbeddings: [embedding],
      nResults: matches || 5,
    });

    // Format results
    const results: SearchResult[] = [];

    if (queryResponse.ids && queryResponse.ids[0]) {
      for (let i = 0; i < queryResponse.ids[0].length; i++) {
        const metadata = queryResponse.metadatas?.[0]?.[i];
        const document = queryResponse.documents?.[0]?.[i];
        const distance = queryResponse.distances?.[0]?.[i];

        results.push({
          id: queryResponse.ids[0][i],
          content_title: (metadata?.content_title as string) || "",
          content_url: (metadata?.content_url as string) || "",
          content_date: (metadata?.content_date as string) || "",
          content_source: (metadata?.content_source as any) || "youtube",
          content: document || "",
          score: distance ? 1 - distance : 0, // Convert distance to similarity score
        });
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export default handler;
