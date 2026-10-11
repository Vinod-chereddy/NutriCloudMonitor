# 🚀 Production Deployment Guide: NutriCloudMonitor (MERN)

This guide walks through deploying the platform in a decoupled, enterprise architecture:
- **Frontend**: [Vercel](https://vercel.com) (Global Edge CDN, instantaneous loading)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (Persistent Node.js Engine with WebSockets for the SOC Telemetry feed)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (Cloud NoSQL Database)

---

## 📋 Pre-Flight Checklist

1. **MongoDB Atlas IP Access**:
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Network Access**.
   - Ensure `0.0.0.0/0` (Allow Access from Anywhere) is added so cloud servers (Render / Vercel) can connect.
2. **Git Repository**:
   - The project is already committed locally. Push it to your GitHub account:
     ```bash
     git remote add origin https://github.com/<your-username>/<your-repo-name>.git
     git branch -M main
     git push -u origin main
     ```

---

## 🛠️ Step 1: Deploy Backend (Render)

1. Sign in to [Render](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `nutricloud-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0...` |
   | `JWT_SECRET` | `nutricloud_jwt_secret_key_2026_secure` |
   | `ADMIN_JWT_SECRET` | `nutricloud_admin_jwt_secret_2026_secure` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` (update after Step 2) |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` (update after Step 2) |
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL:
   `https://nutricloud-backend.onrender.com`

---

## ⚡ Step 2: Deploy Frontend (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click Edit and select `frontend`)
   - **Build Command**: `npm run build` (automatic)
   - **Output Directory**: `dist` (automatic)
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://nutricloud-backend.onrender.com/api` | Your Render Backend API URL |
   | `VITE_SOCKET_URL` | `https://nutricloud-backend.onrender.com` | Your Render Backend URL for WebSockets |
6. Click **Deploy**.
7. Vercel will build and deploy your app in ~30 seconds!

---

## 🔄 Step 3: Final Link & Verification

1. Copy your live Vercel frontend domain (e.g., `https://nutricloud-monitor.vercel.app`).
2. Go back to your **Render Dashboard** → `nutricloud-backend` → **Environment**.
3. Update `FRONTEND_URL` and `CORS_ORIGIN` to your live Vercel domain.
4. Render will automatically redeploy with the exact production domain allowed.

---

## 🛡️ Verified Production Credentials

- **Admin SOC Console**:
  - URL: `https://<your-vercel-domain>/admin/login`
  - Email: `admin@healthcart.com`
  - Password: `admin123`
- **Customer Storefront**:
  - URL: `https://<your-vercel-domain>/login`
  - Email: `user@healthcart.com`
  - Password: `user123`
