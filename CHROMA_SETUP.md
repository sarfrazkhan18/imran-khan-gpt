# ChromaDB Setup Guide

🎉 **Congratulations!** Your project now uses ChromaDB - a completely **FREE** local vector database with **NO API keys required**!

## 🚀 What Changed?

✅ **Removed:**
- Pinecone (cloud service, requires API key)
- LlamaIndex (complex dependency)
- All external vector database dependencies

✅ **Added:**
- ChromaDB (local, free, simple)
- Simplified ingestion script
- No API key requirements

## 💰 Cost Comparison

| Feature | Pinecone (OLD) | ChromaDB (NEW) |
|---------|----------------|----------------|
| **Cost** | $0-70/month | **$0 FOREVER** |
| **API Keys** | Required | **None needed** |
| **Storage** | 100k vectors free | **Unlimited** |
| **Setup Time** | 15 minutes | **5 minutes** |
| **External Dependency** | Yes (cloud) | **No (local)** |

## 📋 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

**On Windows (Command Prompt):**
```cmd
cd %USERPROFILE%\Desktop\imran-khan-gpt
npm install
```

**On Mac/Linux:**
```bash
cd ~/Desktop/imran-khan-gpt
npm install
```

### Step 2: Update Environment Variables

Your `.env.local` file **NO LONGER NEEDS:**
- ❌ PINECONE_API_KEY
- ❌ PINECONE_ENVIRONMENT
- ❌ PINECONE_INDEX_NAME

**You only need:**
- ✅ GOOGLE_API_KEY (Gemini)
- ✅ Firebase credentials (optional for metadata storage)

Edit `.env.local`:
```bash
# Google Gemini API (REQUIRED)
GOOGLE_API_KEY=your_google_api_key_here

# Firebase (OPTIONAL - only if you want to store metadata)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_PRIVATE_KEY="your_key"

# ChromaDB - NO CONFIGURATION NEEDED! 🎉
# It automatically stores data locally in ./chroma_data/
```

### Step 3: Prepare Your Data

Make sure you have sample data or scraped data:

**Option A: Use sample data**
Create `scripts/ik-data.json` with sample content (see `WINDOWS_SETUP.md` for example).

**Option B: Scrape data**
```cmd
npm run scrape:youtube
npm run scrape:twitter
npm run scrape:all
```

### Step 4: Ingest Data

**This is where the magic happens!**

**On Windows:**
```cmd
npm run ingest
```

**On Mac/Linux:**
```bash
npm run ingest
```

**What happens:**
1. ✅ Loads your data from `scripts/ik-data.json`
2. ✅ Chunks content into smaller pieces
3. ✅ Generates embeddings using Gemini
4. ✅ Stores everything **locally** in ChromaDB
5. ✅ **NO external API calls to any vector database!**

**Expected output:**
```
Starting data ingestion with ChromaDB...

Loaded 3 content items

Chunking content...
  [1/3] Sample Speech on Education → 2 chunks
  [2/3] Sample on Healthcare → 1 chunks
  [3/3] Interview on Economic Policy → 2 chunks

✓ Created 5 chunks from 3 items

Resetting ChromaDB collection...
✓ Collection ready

Generating embeddings and storing in ChromaDB...
This may take several minutes depending on the amount of data...

  [5/5] Embedded and stored

✅ Data ingestion complete!

Summary:
  - Content items: 3
  - Total chunks: 5
  - ChromaDB: Vectors stored locally

You can now run 'npm run dev' to start the application!
```

### Step 5: Run the Application

**On Windows:**
```cmd
npm run dev
```

**On Mac/Linux:**
```bash
npm run dev
```

Open http://localhost:3000 and test!

## 📂 Where is Data Stored?

ChromaDB stores all your vector data **locally** in:
```
./chroma_data/
```

This directory is automatically created and contains:
- Vector embeddings
- Metadata
- Index files

**Want to reset everything?**
```bash
# Delete the ChromaDB data directory
rm -rf chroma_data

# Or on Windows:
rmdir /s /q chroma_data

# Then re-run ingestion
npm run ingest
```

## 🔧 How It Works

### Old Setup (Pinecone):
```
Your App → Pinecone Cloud → Vector Storage ($$$)
         ↑ Requires API key
         ↑ Limited free tier
         ↑ Network latency
```

### New Setup (ChromaDB):
```
Your App → ChromaDB (Local) → Vector Storage (FREE!)
         ↑ No API key needed
         ↑ Unlimited storage
         ↑ Instant access (no network)
```

## 🎯 Key Differences

### API Routes Changed

**Before (Pinecone):**
```typescript
export const config = {
  runtime: "edge", // Edge runtime
};
// Used Pinecone client...
```

**After (ChromaDB):**
```typescript
export const config = {
  runtime: "nodejs", // Node.js runtime (required for ChromaDB)
};
// Uses local ChromaDB client...
```

### Ingestion Changed

**Before:**
- Complex LlamaIndex setup
- Pinecone API configuration
- Multiple cloud dependencies

**After:**
- Simple, direct ChromaDB calls
- No external services
- Just runs locally

## ❓ FAQ

### Q: Do I need to run a ChromaDB server?
**A:** No! ChromaDB automatically runs embedded in your Next.js app. Zero configuration!

### Q: What if I want to use a ChromaDB server?
**A:** You can optionally set `CHROMA_URL=http://localhost:8000` in `.env.local` if running Chroma server separately. But it's not needed for basic usage.

### Q: How much data can I store?
**A:** Unlimited! Only limited by your hard drive space. ChromaDB is very efficient.

### Q: Is it slower than Pinecone?
**A:** Actually **FASTER** for most use cases because:
- No network latency
- Data is local
- Instant access

### Q: Can I deploy this to Vercel/Netlify?
**A:** Yes! ChromaDB data can be included in your deployment. The `chroma_data` directory will be bundled with your app.

**Note:** For production deployments with large datasets, consider using ChromaDB server mode or switching to a cloud vector DB.

### Q: How do I update my data?
**A:** Simply run `npm run ingest` again. It will reset the collection and re-ingest all data.

### Q: Can I see what's in ChromaDB?
**A:** Yes! You can query the collection programmatically or use ChromaDB's built-in tools. Check the ChromaDB documentation for details.

## 🔄 Migration Checklist

If you're migrating from the old Pinecone version:

- [x] Removed Pinecone from package.json
- [x] Removed LlamaIndex dependency
- [x] Added ChromaDB
- [x] Updated API routes to use ChromaDB
- [x] Created new ingestion script
- [x] Deleted old Pinecone environment variables
- [x] Installed new dependencies (`npm install`)
- [x] Ready to run `npm run ingest`!

## 🎉 Benefits Summary

1. **$0 Cost** - Completely free, no subscriptions
2. **No API Keys** - One less thing to manage
3. **Faster** - Local access, no network latency
4. **Unlimited** - Store as much data as you want
5. **Simpler** - Less code, fewer dependencies
6. **Private** - All data stays on your machine
7. **Portable** - Easy to move/backup (just copy the folder)

## 📚 Next Steps

1. ✅ Run `npm install`
2. ✅ Update your `.env.local` (remove Pinecone vars)
3. ✅ Run `npm run ingest` with your data
4. ✅ Run `npm run dev` and test
5. ✅ Enjoy your free, fast, local vector database!

## 🆘 Troubleshooting

### Error: "Cannot find module 'chromadb'"
**Solution:**
```bash
npm install
```

### Error: "Collection not found"
**Solution:**
```bash
npm run ingest
```

### Error: "ENOENT: no such file or directory"
**Solution:** Make sure `scripts/ik-data.json` exists. Run scrapers first or create sample data.

### Want to start fresh?
```bash
# Delete ChromaDB data
rm -rf chroma_data

# Re-ingest
npm run ingest
```

---

**🎊 You're all set!** Enjoy your completely free, local vector database with ChromaDB!

Need help? Check the main README.md or open an issue on GitHub.
