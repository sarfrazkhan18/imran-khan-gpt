import { ChromaClient } from "chromadb";

// Initialize ChromaDB client
// Chroma runs locally - no API keys needed!
let chromaClient: ChromaClient | null = null;

export const getChromaClient = async () => {
  if (!chromaClient) {
    chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL || "http://localhost:8000",
    });
  }
  return chromaClient;
};

export const COLLECTION_NAME = "imran_khan_content";

// Get or create the collection for storing embeddings
export const getCollection = async () => {
  const client = await getChromaClient();

  try {
    // Try to get existing collection
    const collection = await client.getCollection({
      name: COLLECTION_NAME,
    });
    return collection;
  } catch (error) {
    // Collection doesn't exist, create it
    const collection = await client.createCollection({
      name: COLLECTION_NAME,
      metadata: {
        description: "Imran Khan speeches, tweets, and interviews",
      },
    });
    return collection;
  }
};

// Helper to delete collection (useful for re-ingestion)
export const deleteCollection = async () => {
  const client = await getChromaClient();
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`Collection "${COLLECTION_NAME}" deleted`);
  } catch (error) {
    console.log(`Collection "${COLLECTION_NAME}" doesn't exist`);
  }
};
