import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchResult } from "@/types";
import { getCollection } from "@/lib/chroma";

export const config = {
  runtime: "nodejs",
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

    // Query ChromaDB
    const collection = await getCollection();

    const queryResponse = await collection.query({
      queryEmbeddings: [Array.from(embedding)],
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

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
    });
  }
};

export default handler;
