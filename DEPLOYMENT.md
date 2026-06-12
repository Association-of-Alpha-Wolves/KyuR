# KyuR Deployment Guide

Deploy the backend to **Railway** and the frontend to **Vercel**. Follow the steps in order — the backend must be live first so you have its URL for the frontend.

---

## Step 1 — Push your code to GitHub

```bash
git add .
git commit -m "feat: remove dummy data, add vercel.json, fix auth"
git push origin main
```

---

## Step 2 — Set up MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → create a free cluster
2. **Database Access** → Add a database user → set a username and password
3. **Network Access** → Add IP Address → `0.0.0.0/0` (required for Railway)
4. **Connect** → Drivers → copy the connection string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/kyur?retryWrites=true&w=majority
   ```

---

## Step 3 — Deploy backend to Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repository → click **Add Service**
3. Click the service → **Settings** tab:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
4. Go to the **Variables** tab and add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string from Step 2 |
| `JWT_SECRET` | A long random secret string |
| `CLIENT_URL` | *(leave blank for now — fill in after Vercel deploy)* |
| `AWS_REGION` | e.g. `ap-southeast-1` |
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `AWS_BUCKET_NAME` | Your S3 bucket name |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |

5. Railway will auto-deploy. Once green, go to **Settings → Networking → Generate Domain**
6. Copy your Railway URL — it looks like:
   ```
   https://kyur-backend-production.up.railway.app
   ```

---

## Step 4 — Deploy frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo
2. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Railway URL from Step 3 |
| `VITE_SOCKET_URL` | Your Railway URL from Step 3 |

4. Click **Deploy**
5. Copy your Vercel URL — it looks like:
   ```
   https://kyur.vercel.app
   ```

---

## Step 5 — Wire the two together

Go back to Railway → **Variables** → set `CLIENT_URL` to your Vercel URL:

```
CLIENT_URL = https://kyur.vercel.app
```

Railway will auto-redeploy. This enables CORS so the frontend can communicate with the backend.

---

## Step 6 — Verify everything works

1. Open your Vercel URL → landing page should load
2. Register with a `@iskolarngbayan.pup.edu.ph` email
3. Log in → should redirect to `/items`
4. Report an item with an image → should upload to S3
5. Visit `/profile` → should show your real name and reported items
6. Visit `/admin/dashboard` → only accessible to users with `role: admin` in MongoDB

---

## Checklist before going live

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] Railway `CLIENT_URL` is set to your Vercel URL (no trailing slash)
- [ ] Vercel `VITE_API_URL` and `VITE_SOCKET_URL` are set to your Railway URL (no trailing slash)
- [ ] `NODE_ENV=production` is set on Railway
- [ ] AWS S3 bucket allows public read access so item images are viewable
