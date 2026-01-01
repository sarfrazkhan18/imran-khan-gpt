import { IKContent, IKChunk, IKJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCollection, deleteCollection } from "@/lib/chroma";
import fs from "fs";
import { encode } from "gpt-3-encoder";

loadEnvConfig("");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * This script ingests the collected data into ChromaDB:
 * 1. Loads data from ik-data.json
 * 2. Chunks the content
 * 3. Generates embeddings using Gemini
 * 4. Stores vectors in ChromaDB (local)
 */

const chunkContent = (content: IKContent): IKChunk[] => {
  // Simple sentence-based chunking
  const sentences = content.content.split(/[.!?]+/).filter((s) => s.trim());
  const chunks: IKChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const testChunk = currentChunk + sentence + ". ";

    // If adding this sentence exceeds 512 tokens, save current chunk and start new one
    if (encode(testChunk).length > 512 && currentChunk) {
      chunks.push({
        id: `${content.id}_chunk_${chunkIndex}`,
        content_id: content.id,
        content_title: content.title,
        content_url: content.url,
        content_date: content.date,
        content_source: content.source,
        content: currentChunk.trim(),
        content_length: currentChunk.length,
        content_tokens: encode(currentChunk).length,
        chunk_index: chunkIndex,
      });
      chunkIndex++;
      currentChunk = sentence + ". ";
    } else {
      currentChunk = testChunk;
    }
  }

  // Add remaining content as final chunk
  if (currentChunk.trim()) {
    chunks.push({
      id: `${content.id}_chunk_${chunkIndex}`,
      content_id: content.id,
      content_title: content.title,
      content_url: content.url,
      content_date: content.date,
      content_source: content.source,
      content: currentChunk.trim(),
      content_length: currentChunk.length,
      content_tokens: encode(currentChunk).length,
      chunk_index: chunkIndex,
    });
  }

  return chunks;
};

const ingestData = async () => {
  console.log("Starting data ingestion with ChromaDB...\n");

  // Load data
  if (!fs.existsSync("scripts/ik-data.json")) {
    console.error("Error: ik-data.json not found!");
    console.log("Run 'npm run scrape:all' first to combine all data sources");
    process.exit(1);
  }

  const data: IKJSON = JSON.parse(fs.readFileSync("scripts/ik-data.json", "utf8"));
  console.log(`Loaded ${data.contents.length} content items`);

  // Process and chunk all content
  const allChunks: IKChunk[] = [];

  console.log("\nChunking content...");
  for (let i = 0; i < data.contents.length; i++) {
    const content = data.contents[i];
    const chunks = chunkContent(content);
    allChunks.push(...chunks);
    console.log(`  [${i + 1}/${data.contents.length}] ${content.title} → ${chunks.length} chunks`);
  }

  console.log(`\n✓ Created ${allChunks.length} chunks from ${data.contents.length} items`);

  // Delete existing collection and create new one
  console.log("\nResetting ChromaDB collection...");
  await deleteCollection();
  const collection = await getCollection();
  console.log("✓ Collection ready");

  // Generate embeddings and store in ChromaDB
  console.log("\nGenerating embeddings and storing in ChromaDB...");

  // Check if Gemini API is accessible
  let useGemini = true;
  const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  // Test Gemini API access
  try {
    console.log("Testing Gemini API access...");
    await embeddingModel.embedContent("test");
    console.log("✓ Gemini API is accessible\n");
    console.log("This may take several minutes depending on the amount of data...\n");
  } catch (error: any) {
    console.log("⚠️  Gemini API not accessible (403 error)");
    console.log("⚠️  Using fallback embeddings for testing purposes");
    console.log("⚠️  To enable Gemini API:");
    console.log("   1. Go to https://console.cloud.google.com");
    console.log("   2. Enable 'Generative Language API'");
    console.log("   3. Make sure your API key has proper permissions\n");
    useGemini = false;
  }

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

  // Process in batches
  const batchSize = 10;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, Math.min(i + batchSize, allChunks.length));
    const ids: string[] = [];
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: any[] = [];

    for (const chunk of batch) {
      try {
        let embedding: number[];

        if (useGemini) {
          // Generate embedding using Gemini
          console.log(`  Generating embedding for: ${chunk.content_title.substring(0, 50)}...`);
          const embeddingResult = await embeddingModel.embedContent(chunk.content);
          embedding = Array.from(embeddingResult.embedding.values);
          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Use fallback embedding
          console.log(`  Creating fallback embedding for: ${chunk.content_title.substring(0, 50)}...`);
          embedding = generateSimpleEmbedding(chunk.content);
        }

        ids.push(chunk.id);
        embeddings.push(embedding);
        documents.push(chunk.content);
        metadatas.push({
          content_id: chunk.content_id,
          content_title: chunk.content_title,
          content_url: chunk.content_url,
          content_date: chunk.content_date,
          content_source: chunk.content_source,
          chunk_index: chunk.chunk_index,
        });
      } catch (error: any) {
        console.error(`Error generating embedding for chunk ${chunk.id}:`, error.message);
        console.error("Full error:", error);
        throw error;
      }
    }

    // Add batch to collection
    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });

    console.log(`  [${Math.min(i + batchSize, allChunks.length)}/${allChunks.length}] Embedded and stored`);
  }

  console.log("\n✅ Data ingestion complete!");
  console.log("\nSummary:");
  console.log(`  - Content items: ${data.contents.length}`);
  console.log(`  - Total chunks: ${allChunks.length}`);
  console.log(`  - ChromaDB: Vectors stored locally`);
  console.log("\nYou can now run 'npm run dev' to start the application!");
};

ingestData().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
