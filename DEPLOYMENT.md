# Deployment Guide

## ✅ Pre-deployment Changes (DONE)
- Frontend now uses environment variable for API URL
- .gitignore files created for both frontend and backend

## 📋 Deployment Steps

### 1. Push to GitHub

```bash
cd C:\Users\hites\OneDrive\Desktop\ai-chat
git init
git add .
git commit -m "AI chat bot with Groq"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-chat.git
git push -u origin main
```

### 2. Deploy Backend on Render

1. Go to **https://render.com** → Sign in with GitHub
2. Click **"New +"** → **Web Service**
3. Select your repo **ai-chat**
4. **Root Directory**: `AI-chat-backend`
5. Settings:
   - **Name**: `ai-chat-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Environment Variables**:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
   - `PORT` = `5000` (optional, Render auto-assigns)
7. Click **Create Web Service**
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL: `https://ai-chat-backend-xxxx.onrender.com`

**Test Backend:**
Visit: `https://ai-chat-backend-xxxx.onrender.com/api/history`
Should see: `{"messages":[]}`

### 3. Deploy Frontend on Vercel

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New..."** → **Project**
3. Import your repo **ai-chat**
4. **Root Directory**: Select `ai-chat-frontend`
5. Framework: Should auto-detect **Vite**
6. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://ai-chat-backend-xxxx.onrender.com` (your Render URL, NO trailing slash)
8. Click **Deploy**
9. Your app will be live at: `https://ai-chat-frontend-xxxx.vercel.app`

### 4. Test Everything

1. Open your Vercel URL
2. Send a message
3. Check if AI responds
4. Refresh page - chat history should persist
5. Test backend directly: `https://your-backend.onrender.com/api/history`

## 🚨 Important Notes

- **Render Free Tier**: Backend sleeps after 15 min of inactivity. First request may take 30-60 seconds to wake up.
- **GROQ_API_KEY**: Make sure it's set correctly in Render environment variables
- **CORS**: Already configured in backend to accept all origins
- **Messages**: Will persist in `messages.json` on Render server

## 🔧 If Something Goes Wrong

**Backend not responding:**
- Check Render logs for errors
- Verify GROQ_API_KEY is set correctly
- Make sure PORT is using `process.env.PORT`

**Frontend can't connect:**
- Check VITE_API_BASE_URL in Vercel settings
- Make sure there's NO trailing slash in the URL
- Check browser console for CORS errors

**Chat history not saving:**
- Check Render logs
- Verify messages.json has write permissions (should work by default)

## 📝 URLs to Submit

After deployment, you'll have:
- **Frontend**: `https://ai-chat-frontend-xxxx.vercel.app` (main link)
- **Backend**: `https://ai-chat-backend-xxxx.onrender.com`
- **GitHub**: `https://github.com/YOUR_USERNAME/ai-chat`

Submit the frontend URL to Fubotics!
