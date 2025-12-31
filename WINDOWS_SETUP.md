# Windows Setup Guide - Imran Khan GPT

Complete guide to run this project on Windows using Command Prompt.

## 📋 Prerequisites

### 1. Install Node.js
1. Download Node.js (v18 or higher): https://nodejs.org/
2. Run the installer (choose "Automatically install necessary tools")
3. Verify installation:
```cmd
node --version
npm --version
```
Should show v18.x.x or higher

### 2. Install Git (if not already installed)
1. Download: https://git-scm.com/download/win
2. Run installer (use default settings)
3. Verify:
```cmd
git --version
```

### 3. Install a Text Editor
- **VS Code** (Recommended): https://code.visualstudio.com/
- Or use Notepad++ or any text editor

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

Open Command Prompt (Win + R, type `cmd`, press Enter):

```cmd
cd %USERPROFILE%\Desktop
git clone https://github.com/sarfrazkhan18/imran-khan-gpt.git
cd imran-khan-gpt
```

### Step 2: Install Dependencies

```cmd
npm install
```

This will take 2-5 minutes. Wait for completion.

### Step 3: Create Environment File

**Option A: Using Command Prompt**
```cmd
copy .env.example .env.local
```

**Option B: Using File Explorer**
1. Open the project folder in File Explorer
2. Right-click `.env.example` → Copy
3. Right-click → Paste
4. Rename to `.env.local`

### Step 4: Edit Environment Variables

Open `.env.local` in your text editor:

**Using VS Code:**
```cmd
code .env.local
```

**Or use Notepad:**
```cmd
notepad .env.local
```

Fill in your API keys:

```bash
# Google Gemini API (REQUIRED)
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX

# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Firebase Admin (REQUIRED)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Pinecone (REQUIRED)
PINECONE_API_KEY=pcsk_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=imran-khan-index

# Optional: Twitter API
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAA

# Optional: YouTube API
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**IMPORTANT for Windows:**
- Firebase private key must be on ONE line
- Keep the quotes around the private key
- Keep `\n` as-is (don't replace with actual line breaks)

Save and close the file.

---

## 🔑 Getting API Keys

### Google Gemini API (Free)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `GOOGLE_API_KEY`

### Firebase (Free)
1. Go to: https://console.firebase.google.com/
2. Create new project: `imran-khan-gpt`
3. Enable Firestore Database:
   - Click "Firestore Database" → Create database
   - Start in production mode → Select region → Enable
4. Get config:
   - Settings (⚙️) → Project settings → General
   - Scroll to "Your apps" → Web app
   - Copy all the config values
5. Get service account:
   - Settings (⚙️) → Project settings → Service accounts
   - Click "Generate new private key" → Download JSON
   - Open the JSON file in Notepad
   - Copy `client_email` → paste in `FIREBASE_CLIENT_EMAIL`
   - Copy entire `private_key` (including \n) → paste in `FIREBASE_PRIVATE_KEY`

### Pinecone (Free)
1. Sign up: https://www.pinecone.io/
2. Create new index:
   - Click "Create Index"
   - Name: `imran-khan-index`
   - Dimensions: `768` (IMPORTANT!)
   - Metric: `cosine`
   - Click Create
3. Get API key:
   - Click "API Keys" in sidebar
   - Copy API key → paste in `PINECONE_API_KEY`
   - Copy Environment (e.g., `us-east-1`) → paste in `PINECONE_ENVIRONMENT`

---

## 📝 Create Sample Data

Create a test file to verify everything works:

**Using Notepad:**
```cmd
notepad scripts\ik-data.json
```

Paste this sample data:

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
      "title": "Sample on Healthcare",
      "url": "https://example.com/healthcare",
      "date": "2024-01-14",
      "source": "speech",
      "content": "Universal healthcare is a fundamental right. Our government is committed to ensuring every Pakistani has access to quality medical care through the Sehat Card program. This initiative will transform healthcare delivery across the nation.",
      "length": 180,
      "tokens": 40,
      "chunks": [],
      "language": "en"
    },
    {
      "id": "sample_003",
      "title": "Interview on Economic Policy",
      "url": "https://example.com/interview1",
      "date": "2024-01-10",
      "source": "interview",
      "content": "Pakistan's economic challenges require structural reforms. We are focusing on increasing exports, promoting industrialization, and creating a business-friendly environment. Our goal is sustainable economic growth that benefits all segments of society, particularly the underprivileged.",
      "length": 320,
      "tokens": 70,
      "chunks": [],
      "language": "en"
    }
  ]
}
```

Save and close (Ctrl + S, then close Notepad).

---

## 🎯 Ingest Data

This creates embeddings and stores them in Pinecone + Firebase:

```cmd
npm run ingest
```

**What you'll see:**
```
Starting data ingestion...
Loaded 3 content items
Chunking content...
  [1/3] Sample Speech on Education → 1 chunks
  [2/3] Sample on Healthcare → 1 chunks
  [3/3] Interview on Economic Policy → 1 chunks
✓ Created 3 chunks from 3 items
Storing metadata in Firebase...
✓ Stored 3 chunks in Firebase
Generating embeddings and storing in Pinecone...
✓ Successfully created embeddings and stored in Pinecone
✅ Data ingestion complete!
```

This may take 2-5 minutes. Wait for completion.

---

## ▶️ Run the Application

```cmd
npm run dev
```

**You should see:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open your browser and go to: **http://localhost:3000**

---

## 🧪 Test the Application

Try these questions:
- "What is Imran Khan's stance on education?"
- "Tell me about healthcare policy"
- "What are the economic reforms?"

You should see:
1. Loading animation
2. AI-generated answer
3. Source passages below

---

## 📊 Add Real Data (Optional)

### Option 1: YouTube Videos

1. Find Imran Khan video IDs from YouTube URLs:
   - Example URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID: `dQw4w9WgXcQ`

2. Edit `scripts\scrape-youtube.ts`:
```cmd
notepad scripts\scrape-youtube.ts
```

3. Find this line and replace with real video IDs:
```typescript
const VIDEO_IDS = [
  "dQw4w9WgXcQ",  // Replace with actual IDs
  "another_video_id",
];
```

4. Run scraper:
```cmd
npm run scrape:youtube
npm run scrape:all
npm run ingest
```

### Option 2: Twitter Posts

1. Get Twitter API credentials (requires developer account)
2. Add to `.env.local`:
```
TWITTER_BEARER_TOKEN=your_token_here
```

3. Run:
```cmd
npm run scrape:twitter
npm run scrape:all
npm run ingest
```

---

## 🐛 Common Windows Issues

### Issue 1: "npm is not recognized"

**Solution:** Add Node.js to PATH
1. Press Win + R, type `sysdm.cpl`, press Enter
2. Advanced → Environment Variables
3. Under "System variables", find `Path`, click Edit
4. Add: `C:\Program Files\nodejs\`
5. Click OK, restart Command Prompt

### Issue 2: "Cannot find module"

**Solution:**
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue 3: Firebase Private Key Error

**Problem:** Error with FIREBASE_PRIVATE_KEY

**Solution:** Make sure the key is formatted correctly:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```
- Must have quotes
- Must be ONE line
- Keep `\n` characters (don't replace with actual newlines)

### Issue 4: Port 3000 Already in Use

**Solution:** Kill the process
```cmd
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

Or use a different port:
```cmd
set PORT=3001
npm run dev
```

### Issue 5: Permission Denied

**Solution:** Run Command Prompt as Administrator
1. Search for "cmd" in Start Menu
2. Right-click → "Run as administrator"
3. Navigate to project folder and try again

### Issue 6: Long Path Names

**Solution:** Enable long paths in Windows
```cmd
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f
```

Restart your computer after running this.

---

## 🔄 Daily Usage Commands

**Start the development server:**
```cmd
cd %USERPROFILE%\Desktop\imran-khan-gpt
npm run dev
```

**Stop the server:**
Press `Ctrl + C` in Command Prompt

**Update data:**
```cmd
npm run scrape:all
npm run ingest
```

**Clean rebuild:**
```cmd
rmdir /s /q node_modules
rmdir /s /q .next
npm install
npm run dev
```

---

## 📁 Project Location

Your project is located at:
```
C:\Users\YourUsername\Desktop\imran-khan-gpt\
```

To open in File Explorer:
```cmd
explorer .
```

To open in VS Code:
```cmd
code .
```

---

## 🎓 Alternative Tools

### PowerShell (Alternative to CMD)
```powershell
# PowerShell commands (use instead of CMD if you prefer)
cd $HOME\Desktop
git clone https://github.com/sarfrazkhan18/imran-khan-gpt.git
cd imran-khan-gpt
npm install
npm run dev
```

### Git Bash (Linux-like commands on Windows)
```bash
# Git Bash commands (more similar to Linux/Mac)
cd ~/Desktop
git clone https://github.com/sarfrazkhan18/imran-khan-gpt.git
cd imran-khan-gpt
npm install
npm run dev
```

---

## ✅ Quick Checklist

Before running `npm run dev`, make sure:

- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Project cloned to `Desktop\imran-khan-gpt`
- [ ] `npm install` completed successfully
- [ ] `.env.local` file created and filled
- [ ] Firebase Firestore enabled
- [ ] Pinecone index created (768 dimensions)
- [ ] `scripts\ik-data.json` exists
- [ ] `npm run ingest` completed successfully
- [ ] Port 3000 is available

---

## 📞 Need Help?

**Check these first:**
1. Node.js version: `node --version` (should be 18+)
2. NPM version: `npm --version` (should be 8+)
3. All API keys filled in `.env.local`
4. Firestore enabled in Firebase Console
5. Pinecone index has 768 dimensions

**Common commands to fix issues:**
```cmd
# Clean install
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install

# Check for errors
npm run build

# View logs
npm run dev > output.log 2>&1
notepad output.log
```

---

## 🎯 Expected Output

When running `npm run dev`, you should see:

```
> imran-khan-gpt@0.1.0 dev
> next dev

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully in 3.2s (199 modules)
```

Then open: **http://localhost:3000**

---

**Success!** 🎉 Your Imran Khan GPT should now be running on Windows!
