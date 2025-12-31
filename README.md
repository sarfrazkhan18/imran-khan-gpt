# Imran Khan GPT

AI-powered search and chat application for Imran Khan's speeches, tweets, and interviews using Google Gemini Flash 2.0, Firebase, and LlamaIndex.

## 🎯 Features

- **Semantic Search**: Find relevant content from Imran Khan's speeches, tweets, and interviews
- **AI Chat**: Ask questions and get answers powered by Google Gemini Flash 2.0
- **Multi-Source Data**: Combines YouTube videos, Twitter posts, speeches, and interviews
- **Real-time Streaming**: Stream AI responses in real-time
- **Source Attribution**: See the exact source (YouTube, Twitter, etc.) for each result

## 🏗️ Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Database**: Firebase Firestore (metadata storage)
- **Vector Database**: Pinecone (vector embeddings)
- **LLM**: Google Gemini Flash 2.0
- **Embeddings**: Google Gemini Text Embedding (text-embedding-004)
- **Framework**: LlamaIndex (document processing and orchestration)

## 📋 Prerequisites

Before you begin, you'll need accounts and API keys for:

1. **Google AI Studio** (for Gemini API)
   - Get your API key: https://makersuite.google.com/app/apikey

2. **Firebase**
   - Create a project: https://console.firebase.google.com/
   - Enable Firestore Database

3. **Pinecone**
   - Create account: https://www.pinecone.io/
   - Free tier includes: 1 index, 100k vectors

4. **Optional - Twitter Developer Account** (for scraping tweets)
   - Apply: https://developer.twitter.com/

5. **Optional - YouTube Data API** (for video metadata)
   - Enable API: https://console.cloud.google.com/apis/library/youtube.googleapis.com

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/imran-khan-gpt.git
cd imran-khan-gpt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your API keys and configuration:

```bash
# Google Gemini API
GOOGLE_API_KEY=your_google_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Service Account)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=imran-khan-index

# Optional: Twitter API
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Optional: YouTube API
YOUTUBE_API_KEY=your_youtube_api_key
```

### 4. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Firestore Database**
4. Go to Project Settings → Service Accounts
5. Generate new private key (download JSON)
6. Copy the values to your `.env.local` file

### 5. Set Up Pinecone

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index:
   - Name: `imran-khan-index`
   - Dimensions: `768` (for Gemini text-embedding-004)
   - Metric: `cosine`
   - Environment: Copy from your Pinecone dashboard
3. Copy API key and environment to `.env.local`

### 6. Collect Data

#### Option A: YouTube Videos

1. Update `scripts/scrape-youtube.ts` with Imran Khan video IDs
2. Run the scraper:

```bash
npm run scrape:youtube
```

#### Option B: Twitter/X Posts

1. Get Twitter API credentials
2. Add to `.env.local`
3. Run the scraper:

```bash
npm run scrape:twitter
```

#### Option C: Manual Data

Create a JSON file at `scripts/ik-data.json` following this structure:

```json
{
  "current_date": "2024-01-15",
  "author": "Imran Khan",
  "url": "https://imrankhan.pk",
  "length": 0,
  "tokens": 0,
  "contents": [
    {
      "id": "speech_001",
      "title": "Speech Title",
      "url": "https://example.com/speech",
      "date": "2024-01-15",
      "source": "speech",
      "content": "Full speech text here...",
      "length": 1000,
      "tokens": 250,
      "chunks": []
    }
  ]
}
```

### 7. Combine All Data Sources

```bash
npm run scrape:all
```

This combines data from all sources into `scripts/ik-data.json`.

### 8. Ingest Data (Create Embeddings)

This step:
- Chunks the content using LlamaIndex
- Generates embeddings with Gemini
- Stores vectors in Pinecone
- Stores metadata in Firebase

```bash
npm run ingest
```

**Note**: This process may take 20-30 minutes depending on data volume. There's a built-in rate limit to avoid API throttling.

### 9. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
imran-khan-gpt/
├── components/           # React components
│   ├── Answer/          # Animated answer display
│   ├── Footer.tsx       # Footer component
│   └── Navbar.tsx       # Navigation bar
├── lib/                 # Utility libraries
│   ├── firebase.ts      # Firebase client config
│   ├── firebase-admin.ts # Firebase admin config
│   ├── gemini-stream.ts # Gemini streaming utilities
│   └── llamaindex-config.ts # LlamaIndex setup
├── pages/
│   ├── api/
│   │   ├── answer.ts    # Gemini chat API
│   │   └── search.ts    # Vector search API
│   ├── index.tsx        # Main application page
│   └── _app.tsx         # Next.js app wrapper
├── scripts/
│   ├── scrape-youtube.ts    # YouTube scraper
│   ├── scrape-twitter.ts    # Twitter scraper
│   ├── scrape-all.ts        # Combine all sources
│   └── ingest-llamaindex.ts # Data ingestion
├── styles/
│   └── globals.css      # Global styles
├── types/
│   └── index.ts         # TypeScript definitions
└── .env.local           # Environment variables (create this)
```

## 🔧 NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run scrape:youtube   # Scrape YouTube videos
npm run scrape:twitter   # Scrape Twitter posts
npm run scrape:all       # Combine all data sources
npm run ingest          # Process and embed data
```

## 🎨 Customization

### Adding New Data Sources

1. Create a new scraper in `scripts/scrape-[source].ts`
2. Follow the `IKContent` type structure
3. Add the source to `scrape-all.ts`
4. Run `npm run scrape:all` and `npm run ingest`

### Changing the LLM Model

Edit `lib/llamaindex-config.ts` and `pages/api/answer.ts`:

```typescript
// For a different Gemini model
model: "gemini-1.5-pro" // or "gemini-1.5-flash"
```

### Adjusting Chunk Size

Edit `lib/llamaindex-config.ts`:

```typescript
Settings.chunkSize = 512;      // Default: 512
Settings.chunkOverlap = 50;    // Default: 50
```

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Firebase permission errors
- Check that Firestore is enabled
- Verify service account has correct permissions
- Ensure private key is properly formatted in `.env.local`

### Pinecone dimension mismatch
- Gemini text-embedding-004 uses 768 dimensions
- Make sure your Pinecone index is created with dimension=768

### Rate limiting errors
- The scripts include delays to prevent rate limiting
- If you hit limits, increase delays in scraping scripts
- Consider using paid tiers for higher limits

## 📝 Notes

- The free tier of Pinecone supports up to 100k vectors
- Gemini API has generous free quotas but check current limits
- Firebase Firestore free tier: 50k reads/20k writes per day
- Always respect rate limits and terms of service

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Credits

- Original Paul Graham GPT by [Mckay Wrigley](https://twitter.com/mckaywrigley)
- Adapted for Imran Khan content using modern AI stack
- Built with [Next.js](https://nextjs.org/), [LlamaIndex](https://www.llamaindex.ai/), and [Google Gemini](https://deepmind.google/technologies/gemini/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

---

**Disclaimer**: This is an educational project demonstrating AI-powered semantic search. All content belongs to its original creators and sources.
