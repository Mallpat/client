# 🌐 Deploying Code Mafia for Public Multiplayer Access

Your project is successfully pushed to GitHub at:
**[https://github.com/Mallpat/client](https://github.com/Mallpat/client)**

Follow this 3-minute guide to deploy the backend to **Render** and the frontend to **Vercel** so your friends can access and play anywhere in the world on any phone or laptop.

---

## Part 1: Deploy Backend to Render (Free Node.js Web Service)

1. Open **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with your GitHub account.
2. Click **New +** (top right) and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and select your repository: **`Mallpat/client`**.
4. Fill in the following settings:
   - **Name**: `code-mafia-server`
   - **Region**: Nearest to you (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
5. Click **Create Web Service**.
6. Wait 1-2 minutes for the deployment to finish. Once live, copy your public backend URL at the top:
   > Example: `https://code-mafia-server-xxxx.onrender.com`

---

## Part 2: Deploy Frontend to Vercel (Free React/Vite Hosting)

1. Open **[https://vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Under **Import Git Repository**, click **Import** next to **`Mallpat/client`**.
3. In the project setup screen:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: Click **Edit** and select the **`client`** folder!
   - Expand **Environment Variables** and add:
     - **NAME**: `VITE_SERVER_URL`
     - **VALUE**: `https://code-mafia-server-xxxx.onrender.com` *(Paste your Render URL from Part 1 without a trailing slash)*
4. Click **Deploy**.
5. Vercel will build and launch your game in ~30 seconds, giving you a shareable link:
   > Example: `https://code-mafia-client.vercel.app`

---

## Part 3: Play with Friends!
1. Send the Vercel link to your friends.
2. Everyone opens the link on their browser (PC, Mac, mobile, or tablet).
3. Enter callsigns, pick suit colors, join the same spaceship room (e.g. `spaceship-01`), and click **LAUNCH SPACESHIP MISSION**!
