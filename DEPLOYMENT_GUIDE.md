# 🚀 MedTwin AI: Deployment Guide to Render

Congratulations on completing MedTwin AI! Deploying a full-stack application (Frontend + Backend) to Render is completely free. We will deploy this as **two separate apps** on Render so they run extremely fast.

Here is your exact step-by-step deployment guide.

---

## Step 1: Fix Hardcoded API URLs (Vital!)
Right now, your frontend files (`Login.jsx`, `Dashboard.jsx`, etc.) are hardcoded to ping `http://localhost:5000`. If you deploy exactly as it is, the live website will try to fetch data from your local laptop!

Let's fix this so it works locally AND on Render:

1. Inside your `frontend` folder, create a new file named `.env` and add this line:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
2. Open `frontend/src/pages/Dashboard.jsx`, `Login.jsx`, `Chat.jsx`, and `Prescriptions.jsx`.
3. In each file, change any instance of `"http://localhost:5000..."` to use the environment variable dynamically.
   *Example:*
   ```javascript
   // Change this:
   const res = await fetch("http://localhost:5000/files");

   // To this:
   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
   const res = await fetch(`${API_BASE}/files`);
   ```

---

## Step 2: Ensure proper Backend Folder Structure
Render needs to know how to start your backend. Open `backend/package.json` and ensure you have a `start` script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## Step 3: Push Entire Project to GitHub
Render connects directly to GitHub to deploy your code automatically.

1. Open your terminal at the root of `C:\MedTwin AI`.
2. Run these commands:
   ```bash
   git add .
   git commit -m "Ready for Render Deployment"
   git push origin main
   ```
*(If you haven't created a GitHub repository yet, go to GitHub.com, create a new empty repository, and follow their instructions to push your local folder).*

---

## Step 4: Deploy the Backend (Web Service)
1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `MedTwin-AI` repository.
4. Fill out the configuration:
   * **Name**: `medtwin-backend`
   * **Root Directory**: `backend` *(Extremely important! Tell Render to look inside the backend folder)*
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Click **Create Web Service**. 
6. *Wait 2-3 minutes for it to finish building.* Once done, copy the URL provided at the top left (e.g., `https://medtwin-backend-xyz.onrender.com`).

---

## Step 5: Deploy the Frontend (Static Site)
Now we push the beautiful React UI!

1. Click **New +** in Render and select **Static Site**.
2. Select the *exact same* `MedTwin-AI` repository.
3. Fill out the configuration:
   * **Name**: `medtwin-app`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `dist`
4. Expand the **Advanced** section and click **Add Environment Variable**.
   * **Key**: `VITE_API_URL`
   * **Value**: Paste the Backend URL you copied from Step 4! *(e.g., `https://medtwin-backend-xyz.onrender.com`)*
5. Click **Create Static Site**.

---

### 🎉 You're Done!
Once the Frontend finishes building (about 1 minute), Render will give you a live URL for your React app. Navigate to it, and your full-stack MedTwin AI application is officially live on the internet!
