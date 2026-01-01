import fs from "fs";
import path from "path";

const CHROMA_DATA_PATH = path.join(process.cwd(), "chroma_data");
const COLLECTION_FILE = path.join(CHROMA_DATA_PATH, "imran_khan_content.json");

export interface VectorDocument {
  id: string;
  embedding: number[];
  document: string;
  metadata: {
    content_title: string;
    content_url: string;
    content_date: string;
    content_source: string;
    chunk_index: number;
  };
}

interface Collection {
  name: string;
  documents: VectorDocument[];
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(CHROMA_DATA_PATH)) {
    fs.mkdirSync(CHROMA_DATA_PATH, { recursive: true });
  }
}

// Load collection from file
function loadCollection(): Collection {
  ensureDataDir();
  if (fs.existsSync(COLLECTION_FILE)) {
    const data = fs.readFileSync(COLLECTION_FILE, "utf8");
    return JSON.parse(data);
  }
  return { name: "imran_khan_content", documents: [] };
}

// Save collection to file
function saveCollection(collection: Collection) {
  ensureDataDir();
  fs.writeFileSync(COLLECTION_FILE, JSON.stringify(collection, null, 2));
}

// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function getCollection() {
  const collection = loadCollection();

  return {
    add: async ({
      ids,
      embeddings,
      documents,
      metadatas,
    }: {
      ids: string[];
      embeddings: number[][];
      documents: string[];
      metadatas: any[];
    }) => {
      for (let i = 0; i < ids.length; i++) {
        collection.documents.push({
          id: ids[i],
          embedding: embeddings[i],
          document: documents[i],
          metadata: metadatas[i],
        });
      }
      saveCollection(collection);
    },

    query: async ({
      queryEmbeddings,
      nResults,
    }: {
      queryEmbeddings: number[][];
      nResults: number;
    }) => {
      const queryEmbedding = queryEmbeddings[0];
      const results = collection.documents
        .map((doc) => ({
          ...doc,
          distance: 1 - cosineSimilarity(queryEmbedding, doc.embedding),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, nResults);

      return {
        ids: [results.map((r) => r.id)],
        distances: [results.map((r) => r.distance)],
        documents: [results.map((r) => r.document)],
        metadatas: [results.map((r) => r.metadata)],
      };
    },
  };
}

export async function deleteCollection() {
  if (fs.existsSync(COLLECTION_FILE)) {
    fs.unlinkSync(COLLECTION_FILE);
    console.log('Collection "imran_khan_content" deleted');
  } else {
    console.log('Collection "imran_khan_content" doesn\'t exist');
  }
}

export const COLLECTION_NAME = "imran_khan_content";
