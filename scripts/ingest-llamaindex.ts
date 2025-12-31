import { IKContent, IKChunk, IKJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import {
  Document,
  SentenceSplitter,
  VectorStoreIndex,
} from "llamaindex";
import fs from "fs";
import { adminDb } from "@/lib/firebase-admin";
import { getPineconeVectorStore } from "@/lib/llamaindex-config";
import { encode } from "gpt-3-encoder";

loadEnvConfig("");

/**
 * This script ingests the collected data into LlamaIndex:
 * 1. Loads data from ik-data.json
 * 2. Chunks the content using LlamaIndex
 * 3. Generates embeddings using Gemini
 * 4. Stores vectors in Pinecone
 * 5. Stores metadata in Firebase
 */

const chunkContent = (content: IKContent): IKChunk[] => {
  const splitter = new SentenceSplitter({
    chunkSize: 512,
    chunkOverlap: 50,
  });

  const chunks: IKChunk[] = [];
  const textChunks = splitter.splitText(content.content);

  textChunks.forEach((text, index) => {
    const chunk: IKChunk = {
      id: `${content.id}_chunk_${index}`,
      content_id: content.id,
      content_title: content.title,
      content_url: content.url,
      content_date: content.date,
      content_source: content.source,
      content: text,
      content_length: text.length,
      content_tokens: encode(text).length,
      chunk_index: index,
    };
    chunks.push(chunk);
  });

  return chunks;
};

const ingestData = async () => {
  console.log("Starting data ingestion...\n");

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
  const documents: Document[] = [];

  console.log("\nChunking content...");
  for (let i = 0; i < data.contents.length; i++) {
    const content = data.contents[i];
    const chunks = chunkContent(content);
    allChunks.push(...chunks);

    // Create LlamaIndex documents
    chunks.forEach((chunk) => {
      const doc = new Document({
        text: chunk.content,
        id_: chunk.id,
        metadata: {
          content_id: chunk.content_id,
          content_title: chunk.content_title,
          content_url: chunk.content_url,
          content_date: chunk.content_date,
          content_source: chunk.content_source,
          chunk_index: chunk.chunk_index,
        },
      });
      documents.push(doc);
    });

    console.log(`  [${i + 1}/${data.contents.length}] ${content.title} → ${chunks.length} chunks`);
  }

  console.log(`\n✓ Created ${allChunks.length} chunks from ${data.contents.length} items`);

  // Store metadata in Firebase
  console.log("\nStoring metadata in Firebase...");
  const batch = adminDb.batch();

  for (const chunk of allChunks) {
    const docRef = adminDb.collection("content_chunks").doc(chunk.id);
    batch.set(docRef, {
      id: chunk.id,
      content_id: chunk.content_id,
      content_title: chunk.content_title,
      content_url: chunk.content_url,
      content_date: chunk.content_date,
      content_source: chunk.content_source,
      content: chunk.content,
      content_length: chunk.content_length,
      content_tokens: chunk.content_tokens,
      chunk_index: chunk.chunk_index,
      created_at: new Date(),
    });
  }

  await batch.commit();
  console.log(`✓ Stored ${allChunks.length} chunks in Firebase`);

  // Create embeddings and store in Pinecone using LlamaIndex
  console.log("\nGenerating embeddings and storing in Pinecone...");
  console.log("This may take several minutes depending on the amount of data...\n");

  try {
    const vectorStore = await getPineconeVectorStore();

    // Create index from documents
    const index = await VectorStoreIndex.fromDocuments(documents, {
      vectorStore,
    });

    console.log("✓ Successfully created embeddings and stored in Pinecone");
  } catch (error) {
    console.error("Error during embedding generation:", error);
    throw error;
  }

  console.log("\n✅ Data ingestion complete!");
  console.log("\nSummary:");
  console.log(`  - Content items: ${data.contents.length}`);
  console.log(`  - Total chunks: ${allChunks.length}`);
  console.log(`  - Firebase: Metadata stored`);
  console.log(`  - Pinecone: Vectors indexed`);
  console.log("\nYou can now run 'npm run dev' to start the application!");
};

ingestData().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
