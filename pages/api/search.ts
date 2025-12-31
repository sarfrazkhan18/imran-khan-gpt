import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchResult } from "@/types";

export const config = {
  runtime: "edge",
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, matches } = (await req.json()) as {
      query: string;
      matches: number;
    };

    const input = query.replace(/\n/g, " ");

    // Generate embedding using Gemini
    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const embeddingResult = await embeddingModel.embedContent(input);
    const embedding = embeddingResult.embedding.values;

    // Query Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || "imran-khan-index");

    const queryResponse = await index.query({
      vector: embedding,
      topK: matches || 5,
      includeMetadata: true,
    });

    // Format results
    const results: SearchResult[] = queryResponse.matches?.map((match) => ({
      id: match.id,
      content_title: (match.metadata?.content_title as string) || "",
      content_url: (match.metadata?.content_url as string) || "",
      content_date: (match.metadata?.content_date as string) || "",
      content_source: (match.metadata?.content_source as any) || "youtube",
      content: (match.metadata?.text as string) || "",
      score: match.score || 0,
    })) || [];

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
    });
  }
};

export default handler;
