# Vector Database Alternatives to Pinecone

Complete guide to replace Pinecone with other vector databases (many with better free tiers or completely free options).

## 🎯 Best Alternatives (Ranked)

### ⭐ Option 1: Supabase + pgvector (RECOMMENDED)
- **Cost:** FREE forever (500 MB database)
- **Why:** PostgreSQL-based, generous free tier, easy to use
- **Setup Time:** 10 minutes
- **Best For:** Most users

### 🚀 Option 2: Qdrant Cloud
- **Cost:** FREE tier (1 GB storage)
- **Why:** Fast, modern, great API
- **Setup Time:** 5 minutes
- **Best For:** High performance needs

### 💾 Option 3: Chroma (Local/Self-hosted)
- **Cost:** 100% FREE (runs locally)
- **Why:** Zero external dependencies, easy setup
- **Setup Time:** 2 minutes
- **Best For:** Development, small projects

### 🗄️ Option 4: Weaviate Cloud
- **Cost:** FREE sandbox
- **Why:** Feature-rich, good documentation
- **Setup Time:** 10 minutes
- **Best For:** Advanced features

### 📦 Option 5: MongoDB Atlas Vector Search
- **Cost:** FREE tier (512 MB)
- **Setup Time:** 10 minutes
- **Best For:** Already using MongoDB

---

## 🏆 Option 1: Supabase + pgvector (Best for Most Users)

Supabase offers PostgreSQL with pgvector extension - perfect for vector search.

### Why Choose Supabase?
- ✅ **FREE forever** (up to 500 MB database)
- ✅ **No credit card required**
- ✅ Unlimited API requests
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Easy to use dashboard

### Setup Steps

#### 1. Create Supabase Project

1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up (free, no credit card)
4. Create new project:
   - Name: `imran-khan-gpt`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
   - Plan: Free

#### 2. Enable pgvector Extension

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Paste this SQL:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create table for embeddings
create table if not exists content_chunks (
  id text primary key,
  content_id text,
  content_title text,
  content_url text,
  content_date text,
  content_source text,
  content text,
  content_length bigint,
  content_tokens bigint,
  chunk_index integer,
  embedding vector(768),
  created_at timestamp default now()
);

-- Create index for vector similarity search
create index on content_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create search function
create or replace function search_chunks (
  query_embedding vector(768),
  match_count int default 5,
  similarity_threshold float default 0.5
)
returns table (
  id text,
  content_title text,
  content_url text,
  content_date text,
  content_source text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    content_chunks.id,
    content_chunks.content_title,
    content_chunks.content_url,
    content_chunks.content_date,
    content_chunks.content_source,
    content_chunks.content,
    1 - (content_chunks.embedding <=> query_embedding) as similarity
  from content_chunks
  where 1 - (content_chunks.embedding <=> query_embedding) > similarity_threshold
  order by content_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

4. Click "Run"

#### 3. Get API Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

#### 4. Update Environment Variables

Replace Pinecone variables in `.env.local`:

```bash
# Remove these:
# PINECONE_API_KEY=...
# PINECONE_ENVIRONMENT=...
# PINECONE_INDEX_NAME=...

# Add these:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 5. Update Dependencies

```bash
npm install @supabase/supabase-js
npm uninstall @pinecone-database/pinecone
```

#### 6. Update Code Files

**Create `lib/supabase.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Update `pages/api/search.ts`:**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";
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

    // Query Supabase
    const { data, error } = await supabaseAdmin.rpc("search_chunks", {
      query_embedding: embedding,
      match_count: matches || 5,
      similarity_threshold: 0.5,
    });

    if (error) {
      console.error("Search error:", error);
      throw error;
    }

    const results: SearchResult[] = data.map((item: any) => ({
      id: item.id,
      content_title: item.content_title,
      content_url: item.content_url,
      content_date: item.content_date,
      content_source: item.content_source,
      content: item.content,
      score: item.similarity,
    }));

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
    });
  }
};

export default handler;
```

**Update `scripts/ingest-llamaindex.ts`:**

```typescript
import { IKContent, IKChunk, IKJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import { encode } from "gpt-3-encoder";

loadEnvConfig("");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const chunkContent = (content: IKContent): IKChunk[] => {
  // Simple chunking by sentences
  const sentences = content.content.split(/[.!?]+/).filter(s => s.trim());
  const chunks: IKChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const sentence of sentences) {
    if (encode(currentChunk + sentence).length > 512 && currentChunk) {
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
      currentChunk = sentence;
    } else {
      currentChunk += sentence + ". ";
    }
  }

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
  console.log("Starting data ingestion...\n");

  if (!fs.existsSync("scripts/ik-data.json")) {
    console.error("Error: ik-data.json not found!");
    process.exit(1);
  }

  const data: IKJSON = JSON.parse(fs.readFileSync("scripts/ik-data.json", "utf8"));
  console.log(`Loaded ${data.contents.length} content items`);

  const allChunks: IKChunk[] = [];

  console.log("\nChunking content...");
  for (let i = 0; i < data.contents.length; i++) {
    const content = data.contents[i];
    const chunks = chunkContent(content);
    allChunks.push(...chunks);
    console.log(`  [${i + 1}/${data.contents.length}] ${content.title} → ${chunks.length} chunks`);
  }

  console.log(`\n✓ Created ${allChunks.length} chunks`);

  // Generate embeddings and store
  console.log("\nGenerating embeddings and storing in Supabase...\n");

  const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];

    // Generate embedding
    const embeddingResult = await embeddingModel.embedContent(chunk.content);
    const embedding = embeddingResult.embedding.values;

    // Store in Supabase
    const { error } = await supabaseAdmin.from("content_chunks").insert({
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
      embedding: embedding,
    });

    if (error) {
      console.error(`Error storing chunk ${i + 1}:`, error);
    } else {
      console.log(`  [${i + 1}/${allChunks.length}] Stored and embedded: ${chunk.content_title}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n✅ Data ingestion complete!");
  console.log(`\nTotal chunks: ${allChunks.length}`);
};

ingestData().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

#### 7. Remove LlamaIndex & Pinecone

Update `package.json`:

```bash
npm uninstall llamaindex @pinecone-database/pinecone
```

Delete these files:
- `lib/llamaindex-config.ts`

#### 8. Run Ingestion

```bash
npm run ingest
```

---

## 🚀 Option 2: Qdrant Cloud

Free tier with 1 GB storage.

### Setup

1. Sign up at https://cloud.qdrant.io/
2. Create cluster (free tier)
3. Get API key and URL

**Update `.env.local`:**
```bash
QDRANT_URL=https://xxx.qdrant.io
QDRANT_API_KEY=your_api_key
```

**Install:**
```bash
npm install @qdrant/js-client-rest
```

**Update `pages/api/search.ts`:**
```typescript
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

// In handler:
const searchResult = await client.search("imran_khan_collection", {
  vector: embedding,
  limit: matches || 5,
});
```

---

## 💾 Option 3: Chroma (Local - 100% Free)

Perfect for development or small deployments.

**Install:**
```bash
npm install chromadb
```

**No API keys needed!** Runs locally.

**Update code:**
```typescript
import { ChromaClient } from "chromadb";

const client = new ChromaClient();
const collection = await client.getOrCreateCollection({
  name: "imran_khan",
});

// Search
const results = await collection.query({
  queryEmbeddings: [embedding],
  nResults: matches || 5,
});
```

---

## 📊 Comparison Table

| Feature | Supabase | Qdrant | Chroma | Pinecone |
|---------|----------|--------|--------|----------|
| **Free Tier** | ✅ 500 MB | ✅ 1 GB | ✅ Unlimited | ❌ 1 index only |
| **Cost** | $0 | $0 | $0 | $0-70/mo |
| **Setup Time** | 10 min | 5 min | 2 min | 5 min |
| **Credit Card** | No | No | No | Yes (free tier) |
| **Hosting** | Cloud | Cloud | Local/Cloud | Cloud |
| **Dashboard** | ✅ Excellent | ✅ Good | ❌ No | ✅ Good |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Best For** | Most users | High performance | Dev/Small | Enterprise |

---

## 💡 My Recommendation

**For your project, use Supabase because:**
1. ✅ **Completely FREE** (500 MB is plenty)
2. ✅ No credit card required
3. ✅ Easy setup with SQL
4. ✅ Built-in dashboard
5. ✅ Can grow with you
6. ✅ PostgreSQL = familiar & reliable
7. ✅ Bonus features (auth, storage, real-time)

**Migration time:** ~15 minutes

**Long-term cost:** $0 for moderate usage

---

## 🔄 Quick Migration Guide (Pinecone → Supabase)

```bash
# 1. Create Supabase project (5 min)
# 2. Run SQL to create tables (1 min)
# 3. Update environment variables (2 min)
npm install @supabase/supabase-js
npm uninstall @pinecone-database/pinecone llamaindex

# 4. Update code files (5 min)
# - Create lib/supabase.ts
# - Update pages/api/search.ts
# - Update scripts/ingest-llamaindex.ts

# 5. Re-ingest data (2-5 min)
npm run ingest

# 6. Test
npm run dev
```

**Total time:** ~15 minutes

---

## ✅ Benefits of Switching

**From Pinecone to Supabase:**
- 💰 Save money (Pinecone paid tier = $70/month)
- 🎁 More free features (auth, storage, real-time)
- 📊 Better dashboard
- 🔒 More control over data
- 🚀 Easier to scale

---

## 🆘 Need Help?

Choose which option you want and I can provide:
1. Complete code files
2. Step-by-step setup
3. Migration script
4. Testing guide

Let me know which vector DB you prefer! 🚀
