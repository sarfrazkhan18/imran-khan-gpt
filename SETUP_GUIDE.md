# Quick Start Guide: Imran Khan GPT

## 🚀 From Zero to Running in 30 Minutes

### Step 1: Get Your API Keys (10 minutes)

#### 1.1 Google Gemini API (Required)
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key → Save for later

#### 1.2 Firebase (Required)
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Name it: `imran-khan-gpt`
4. Enable Firestore Database (Start in production mode)
5. Go to Project Settings → General → Copy all config values
6. Go to Project Settings → Service Accounts → Generate new private key
7. Save the JSON file

#### 1.3 Pinecone (Required)
1. Sign up at https://www.pinecone.io/
2. Create new index:
   - Name: `imran-khan-index`
   - Dimensions: `768`
   - Metric: `cosine`
3. Copy your API key from API Keys section
4. Note your Environment (e.g., `us-east-1`)

#### 1.4 Twitter API (Optional)
1. Apply at https://developer.twitter.com/
2. Create app → Copy Bearer Token

---

### Step 2: Install & Configure (5 minutes)

```bash
# Clone and install
git clone <your-repo>
cd imran-khan-gpt
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```bash
# Minimum required for testing:
GOOGLE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=imran-khan-index
```

---

### Step 3: Add Sample Data (5 minutes)

Create `scripts/ik-data.json`:

```json
{
  "current_date": "2024-01-15",
  "author": "Imran Khan",
  "url": "https://imrankhan.pk",
  "length": 0,
  "tokens": 0,
  "contents": [
    {
      "id": "sample_001",
      "title": "Sample Speech on Education",
      "url": "https://example.com/speech1",
      "date": "2024-01-15",
      "source": "speech",
      "content": "Education is the cornerstone of a progressive society. We must invest in our youth and provide quality education to all Pakistanis, regardless of their background. This is not just a moral imperative, but an economic necessity for Pakistan's future.",
      "length": 250,
      "tokens": 50,
      "chunks": [],
      "language": "en"
    },
    {
      "id": "sample_002",
      "title": "Sample Tweet on Healthcare",
      "url": "https://twitter.com/ImranKhanPTI/status/123",
      "date": "2024-01-14",
      "source": "twitter",
      "content": "Universal healthcare is a fundamental right. Our government is committed to ensuring every Pakistani has access to quality medical care through the Sehat Card program.",
      "length": 150,
      "tokens": 35,
      "chunks": [],
      "tweet_id": "123",
      "language": "en"
    },
    {
      "id": "sample_003",
      "title": "Interview on Economic Policy",
      "url": "https://example.com/interview1",
      "date": "2024-01-10",
      "source": "interview",
      "content": "Pakistan's economic challenges require structural reforms. We are focusing on increasing exports, promoting industrialization, and creating a business-friendly environment. Our goal is sustainable economic growth that benefits all segments of society.",
      "length": 300,
      "tokens": 65,
      "chunks": [],
      "language": "en"
    }
  ]
}
```

---

### Step 4: Ingest Data (5 minutes)

```bash
npm run ingest
```

This will:
- ✅ Chunk the content
- ✅ Generate embeddings with Gemini
- ✅ Store in Pinecone
- ✅ Save metadata to Firebase

Wait for completion message.

---

### Step 5: Run the App (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

Try asking:
- "What is Imran Khan's stance on education?"
- "Tell me about healthcare policy"
- "What are his economic reforms?"

---

## 🎯 What's Next?

### Add Real Data

#### Option 1: YouTube Videos

1. Find Imran Khan video IDs from YouTube URLs
   - Example: `https://youtube.com/watch?v=VIDEO_ID_HERE`

2. Edit `scripts/scrape-youtube.ts`:
```typescript
const VIDEO_IDS = [
  "dQw4w9WgXcQ",  // Replace with real IDs
  "another_id",
];
```

3. Run:
```bash
npm run scrape:youtube
npm run scrape:all
npm run ingest
```

#### Option 2: Twitter Posts

1. Get Twitter API credentials
2. Add to `.env.local`:
```bash
TWITTER_BEARER_TOKEN=your_token_here
```

3. Run:
```bash
npm run scrape:twitter
npm run scrape:all
npm run ingest
```

---

## 🐛 Common Issues

### "Firebase permission denied"
- Make sure Firestore is enabled in Firebase Console
- Check that FIREBASE_PRIVATE_KEY has quotes and `\n` characters

### "Pinecone dimension mismatch"
- Delete and recreate index with dimensions=768
- Gemini text-embedding-004 uses 768 dimensions

### "Rate limit exceeded"
- Gemini free tier: 60 requests/minute
- Add delays in scripts if hitting limits
- Consider upgrading to paid tier

### "Module not found: llamaindex"
- Run: `rm -rf node_modules && npm install`
- Make sure Node.js version is 18 or higher

---

## 💡 Tips

1. **Start Small**: Test with 3-5 pieces of content first
2. **Check Costs**: All services have free tiers, but monitor usage
3. **Backup Data**: Save your JSON files before re-ingesting
4. **Test Queries**: Try different questions to see quality of results
5. **Iterate**: Add more data gradually and monitor performance

---

## 📊 Expected Costs (Free Tier)

- **Gemini API**: Free (60 req/min, 1500 req/day)
- **Pinecone**: Free (1 index, 100k vectors)
- **Firebase**: Free (50k reads, 20k writes/day)
- **Vercel Hosting**: Free (100 GB bandwidth)

**Estimated**: $0/month for small projects (< 1000 documents)

---

## 🎓 Learning Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [Pinecone Guides](https://docs.pinecone.io/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Next.js Documentation](https://nextjs.org/docs)

---

## ✅ Checklist

- [ ] Got all API keys
- [ ] Installed dependencies
- [ ] Created `.env.local` file
- [ ] Set up Pinecone index (768 dimensions)
- [ ] Enabled Firestore in Firebase
- [ ] Created sample data file
- [ ] Ran `npm run ingest`
- [ ] Started dev server
- [ ] Tested with sample queries
- [ ] Ready to add real data!

---

**Need Help?** Check the main README.md for detailed troubleshooting or open an issue on GitHub.
