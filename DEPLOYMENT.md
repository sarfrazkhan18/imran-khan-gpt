# Deployment Guide - Imran Khan GPT

Complete guide to deploy your Imran Khan GPT application to production.

## 🚀 Best Deployment Options

### ⭐ Option 1: Vercel (Recommended)
- **Best for:** Next.js projects (Vercel created Next.js)
- **Free Tier:** Yes (Generous)
- **Difficulty:** ⭐ Very Easy
- **Edge Runtime:** ✅ Fully supported
- **Deploy Time:** 2-5 minutes

### Option 2: Netlify
- **Best for:** Static sites & serverless functions
- **Free Tier:** Yes
- **Difficulty:** ⭐⭐ Easy
- **Edge Runtime:** ✅ Supported
- **Deploy Time:** 5-10 minutes

### Option 3: Railway
- **Best for:** Full-stack apps
- **Free Tier:** $5 credit/month
- **Difficulty:** ⭐⭐ Easy
- **Deploy Time:** 5-10 minutes

### Option 4: Self-Hosted (VPS)
- **Best for:** Complete control
- **Free Tier:** No (DigitalOcean from $4/month)
- **Difficulty:** ⭐⭐⭐⭐ Advanced
- **Deploy Time:** 30-60 minutes

---

## 🎯 Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest and best option for Next.js applications.

### Prerequisites
- GitHub account
- Project pushed to GitHub
- All API keys ready

### Step 1: Push to GitHub

**On Windows (Command Prompt):**
```cmd
cd %USERPROFILE%\Desktop\imran-khan-gpt
git add .
git commit -m "Ready for deployment"
git push origin main
```

**On Mac/Linux:**
```bash
cd ~/Desktop/imran-khan-gpt
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Sign Up for Vercel

1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Find `imran-khan-gpt` repository
4. Click "Import"

### Step 4: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

### Step 5: Add Environment Variables

Click "Environment Variables" and add all of these:

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

# Firebase Admin
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=imran-khan-index

# Optional: Twitter API
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Optional: YouTube API
YOUTUBE_API_KEY=your_youtube_api_key
```

**Important:**
- For `FIREBASE_PRIVATE_KEY`, paste the entire key including `\n` characters
- All variables should be in one line

### Step 6: Deploy

1. Click "Deploy"
2. Wait 2-5 minutes
3. Your site will be live at: `https://your-project-name.vercel.app`

### Step 7: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Done! Your site will be at your custom domain

---

## 🌐 Option 2: Deploy to Netlify

### Step 1: Push to GitHub

Same as Vercel (see above).

### Step 2: Sign Up for Netlify

1. Go to: https://app.netlify.com/signup
2. Click "Sign up with GitHub"
3. Authorize Netlify

### Step 3: Create New Site

1. Click "Add new site" → "Import an existing project"
2. Choose "GitHub"
3. Select `imran-khan-gpt` repository

### Step 4: Configure Build Settings

**Base directory:** (leave empty)

**Build command:** `npm run build`

**Publish directory:** `.next`

**Functions directory:** `netlify/functions` (auto-detected)

### Step 5: Add Environment Variables

Go to Site settings → Environment variables → Add variables:

(Same variables as Vercel - see above)

### Step 6: Deploy

1. Click "Deploy site"
2. Wait 5-10 minutes
3. Your site will be live at: `https://random-name-123.netlify.app`

### Step 7: Custom Domain (Optional)

1. Go to Domain settings → Add custom domain
2. Follow DNS configuration instructions

---

## 🚂 Option 3: Deploy to Railway

### Step 1: Sign Up

1. Go to: https://railway.app/
2. Click "Login with GitHub"
3. Authorize Railway

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `imran-khan-gpt`

### Step 3: Configure

Railway will auto-detect Next.js.

Add environment variables:
1. Click on your service
2. Go to "Variables" tab
3. Add all environment variables (same as Vercel)

### Step 4: Deploy

1. Railway will automatically deploy
2. Click "Generate Domain" to get a public URL
3. Your site will be at: `https://your-project.up.railway.app`

---

## 🖥️ Option 4: Self-Hosted (VPS)

For advanced users who want full control.

### Providers
- **DigitalOcean** ($4/month): https://www.digitalocean.com/
- **Linode** ($5/month): https://www.linode.com/
- **Vultr** ($2.50/month): https://www.vultr.com/
- **Hetzner** (€4/month): https://www.hetzner.com/

### Quick Setup (Ubuntu 22.04)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Clone your repository
git clone https://github.com/yourusername/imran-khan-gpt.git
cd imran-khan-gpt

# 5. Install dependencies
npm install

# 6. Create .env.local file
nano .env.local
# Paste your environment variables, save (Ctrl+X, Y, Enter)

# 7. Build the application
npm run build

# 8. Start with PM2
pm2 start npm --name "imran-khan-gpt" -- start
pm2 save
pm2 startup

# 9. Install Nginx (reverse proxy)
sudo apt install nginx -y

# 10. Configure Nginx
sudo nano /etc/nginx/sites-available/imran-khan-gpt
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/imran-khan-gpt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (HTTPS)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com

# Done! Your site is live at https://your-domain.com
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use different API keys for development and production
- ✅ Rotate API keys regularly

### 2. API Rate Limiting
- ✅ Monitor your API usage in Vercel/Netlify dashboard
- ✅ Set up alerts for unusual traffic
- ✅ Consider adding rate limiting middleware

### 3. Firebase Security Rules
Add these to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /content_chunks/{document} {
      allow read: if true;  // Public read access
      allow write: if false;  // No public writes
    }
  }
}
```

### 4. CORS Configuration
If you get CORS errors, add this to your API routes:

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Recommended)
1. Go to your project in Vercel
2. Click "Analytics" tab
3. Enable "Web Analytics"
4. View real-time traffic and performance

### Google Analytics
Add to `pages/_app.tsx`:

```typescript
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  )
}
```

### Firebase Analytics
Already included if you've set up Firebase properly.

---

## 🚨 Troubleshooting Deployment Issues

### Build Failed: "Module not found"
**Solution:**
```bash
# Make sure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Build Failed: "Environment variable missing"
**Solution:**
- Double-check all environment variables are added
- Make sure there are no typos
- Verify Firebase private key is formatted correctly

### API Routes Not Working
**Solution:**
- Check that files are in `pages/api/` folder
- Verify Next.js version supports Edge Runtime
- Check deployment logs for specific errors

### 500 Internal Server Error
**Solution:**
1. Check deployment logs in Vercel/Netlify dashboard
2. Verify all API keys are correct
3. Check Firebase permissions
4. Verify Pinecone index exists and has correct dimensions

### Database Connection Failed
**Solution:**
- Verify Firebase project ID is correct
- Check that Firestore is enabled
- Verify service account credentials
- Check Firebase security rules allow reads

---

## 💰 Cost Estimation

### Free Tier Limits

**Vercel Free:**
- 100 GB bandwidth/month
- 100 GB-hours compute/month
- Unlimited deployments
- **Cost:** $0

**Netlify Free:**
- 100 GB bandwidth/month
- 300 build minutes/month
- **Cost:** $0

**Firebase Free (Spark Plan):**
- 50k reads/day
- 20k writes/day
- 1 GB storage
- **Cost:** $0

**Pinecone Free:**
- 1 index
- 100k vectors
- **Cost:** $0

**Gemini API Free:**
- 60 requests/minute
- 1,500 requests/day
- **Cost:** $0

**Total Monthly Cost (Free Tier):** $0

### Paid Tier (If Needed)

**Vercel Pro:** $20/month
- 1 TB bandwidth
- Unlimited team members

**Firebase Blaze (Pay as you go):**
- ~$0.06 per 100k reads
- ~$0.18 per 100k writes

**Pinecone Starter:** $70/month
- 5 indexes
- Higher performance

**Estimated for 10k users/month:** $0-50/month

---

## 🎯 Recommended Setup

For most users:

```
1. Deploy to Vercel (Free)
2. Use Firebase Spark Plan (Free)
3. Use Pinecone Free Tier (Free)
4. Use Gemini API Free Tier (Free)

Total: $0/month
```

When you grow:

```
1. Upgrade to Vercel Pro ($20/month)
2. Upgrade to Firebase Blaze (pay-as-you-go)
3. Monitor costs and scale as needed

Estimated: $20-100/month for significant traffic
```

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Test the live site thoroughly
- [ ] Try search functionality
- [ ] Try chat functionality
- [ ] Check that sources display correctly
- [ ] Verify all API calls work
- [ ] Test on mobile devices
- [ ] Check loading times
- [ ] Set up monitoring/analytics
- [ ] Configure custom domain (optional)
- [ ] Set up SSL/HTTPS (auto on Vercel/Netlify)
- [ ] Share with users!

---

## 📱 Mobile Optimization

Your site is already mobile-responsive thanks to Tailwind CSS, but verify:

1. Test on actual mobile devices
2. Check touch interactions
3. Verify text is readable
4. Ensure buttons are tappable
5. Test loading times on 3G/4G

---

## 🔄 Continuous Deployment

With Vercel/Netlify, every push to `main` branch auto-deploys:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel/Netlify automatically:
# 1. Detects the push
# 2. Runs build
# 3. Deploys to production
# 4. Done! Changes are live in ~2 minutes
```

---

## 🎓 Next Steps After Deployment

1. **Add More Data:** Scrape more videos/tweets
2. **Custom Domain:** Get a `.com` or `.ai` domain
3. **SEO Optimization:** Add meta tags, sitemap
4. **Social Sharing:** Add Open Graph images
5. **Analytics:** Monitor user behavior
6. **Feedback:** Add a feedback form
7. **Marketing:** Share on social media!

---

## 📞 Support

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**Netlify:**
- Docs: https://docs.netlify.com/
- Forums: https://answers.netlify.com/

**Firebase:**
- Docs: https://firebase.google.com/docs
- Support: https://firebase.google.com/support

---

**Your project is now live! 🎉**

Share your deployment URL and start collecting user feedback!
