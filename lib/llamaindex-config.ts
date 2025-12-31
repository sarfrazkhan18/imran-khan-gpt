import {
  Gemini,
  GeminiEmbedding,
  PineconeVectorStore,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Gemini LLM
const geminiLLM = new Gemini({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "models/gemini-2.0-flash-exp",
  temperature: 0.1,
  topP: 0.95,
  maxOutputTokens: 2048,
});

// Initialize Gemini Embeddings
const geminiEmbedding = new GeminiEmbedding({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "models/text-embedding-004",
});

// Set global LlamaIndex settings
Settings.llm = geminiLLM;
Settings.embedModel = geminiEmbedding;
Settings.chunkSize = 512;
Settings.chunkOverlap = 50;

// Initialize Pinecone client
let pinecone: Pinecone | null = null;
let vectorStore: PineconeVectorStore | null = null;

export const initializePinecone = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

export const getPineconeVectorStore = async () => {
  if (!vectorStore) {
    const pc = await initializePinecone();
    const pineconeIndex = pc.Index(process.env.PINECONE_INDEX_NAME || "imran-khan-index");

    vectorStore = new PineconeVectorStore({
      pineconeIndex,
    });
  }
  return vectorStore;
};

export const getVectorStoreIndex = async () => {
  const vectorStore = await getPineconeVectorStore();
  const storageContext = await storageContextFromDefaults({ vectorStore });

  return await VectorStoreIndex.fromVectorStore(vectorStore, storageContext);
};

export { geminiLLM, geminiEmbedding };
