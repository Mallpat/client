# 🌐 Code Mafia 2D Dreadnought — Full Deployment & Socket.IO Setup Guide

This guide explains how to:
1. **Play Locally Right Now** (Solo or Local Multiplayer)
2. **Push Code to GitHub**
3. **Deploy Backend to Render** (Free 24/7 Socket.IO WebSocket Server)
4. **Deploy Frontend to Vercel** (Global Fast CDN for Vite + React)

---

## ⚡ Option 1: Play Locally on your Machine (Right Now!)

### A. Solo Simulation Mode (No Backend Needed)
1. Go to your browser at **[http://localhost:5173/](http://localhost:5173/)**.
2. Click **🚀 LAUNCH SOLO SIMULATION (TEST GRAPHICS & SHIP) ➔**.
3. You will immediately board the Dreadnought with AI Avenger teammates, explore all 6 sectors with high-res graphics, test superhero abilities, and solve real engineering terminals directly in the browser!

### B. Local Multiplayer (Run Backend on Port 5000)
1. Open a new terminal in this folder:
   ```bash
   npm run server
   ```
2. Your backend is now running on `http://localhost:5000`.
3. Refresh **http://localhost:5173/** — the top banner will immediately show **`🟢 GAME SERVER ONLINE`**!
4. Open the link in multiple browser tabs or windows to test real-time multiplayer!

---

## 🐙 Option 2: Push to GitHub

To push your latest high-graphics code to your GitHub repository:

Open your terminal in this project folder and run:
```bash
git init
git add .
git commit -m "feat: high graphics visual overhaul, Avengers vector suite, and server deployment config"
git branch -M main
git remote add origin https://github.com/Mallpat/client.git
git push -u origin main --force
```
*(If you are using a different GitHub repository URL, replace `https://github.com/Mallpat/client.git` with your repository URL).*

---

## 🚀 Option 3: Deploy Backend to Render (Free Socket.IO Server)

> 💡 **Why Render?**
> Vercel is a serverless platform (lambdas) and does not support long-lived persistent WebSocket connections (Socket.IO). Render provides a free persistent Node.js Web Service that keeps Socket.IO connected 24/7.

1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub.
2. Click **New +** (top right) ➔ **Web Service**.
3. Select your repository: **`Mallpat/client`**.
4. Configure the settings:
   - **Name**: `code-mafia-server`
   - **Region**: Nearest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
5. Click **Create Web Service**.
6. Wait ~2 minutes for it to build. Once live, Render displays your public server URL at the top:
   > Example: `https://code-mafia-server-xxxx.onrender.com`

---

## ⚡ Option 4: Deploy Frontend to Vercel

1. Go to **[https://vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Under **Import Git Repository**, click **Import** next to your repo **`Mallpat/client`**.
3. In the setup screen:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `./` (leave default root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_SERVER_URL`
   - **Value**: `https://code-mafia-server-xxxx.onrender.com` *(Paste your Render URL from Option 3 without trailing slash)*
5. Click **Deploy**.
6. In ~30 seconds, Vercel will give you your production URL:
   > Example: `https://client-xxxx.vercel.app`

---

## 🎮 Boarding the Ship & Playing with Friends
1. Send your **Vercel link** to your friends.
2. Everyone selects their favorite Avenger hero (Iron Man, Thor, Captain America, Spider-Man, Doctor Strange, etc.).
3. Enter the same Sector Code (e.g. `spaceship-01`) and board the ship together!
