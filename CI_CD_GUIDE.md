# KyuR — CI/CD Setup Checklist

The workflow file is already at `.github/workflows/ci-cd.yml`. You only need to configure secrets and environment variables.

---

## Step 1 — Link Vercel locally (one-time)

Inside your `frontend/` folder, run:

```bash
npx vercel login
npx vercel link
```

Then open `frontend/.vercel/project.json` and copy:
- `"orgId"` → you'll need this in Step 2
- `"projectId"` → you'll need this in Step 2

Make sure `.vercel/` is in your `.gitignore`.

---

## Step 2 — Add secrets to GitHub

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.

Add all of these:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `frontend/.vercel/project.json` → `"orgId"` |
| `VERCEL_PROJECT_ID` | `frontend/.vercel/project.json` → `"projectId"` |
| `RAILWAY_TOKEN` | railway.app → Account Settings → Tokens → New Token |
| `VITE_API_URL` | Your Railway backend URL (e.g. `https://kyur-backend.up.railway.app`) |
| `VITE_SOCKET_URL` | Same Railway backend URL |

---

## Step 3 — Set env vars on Railway

In your **Railway dashboard** → your backend service → Variables, add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your JWT secret |
| `CLIENT_URL` | Your Vercel frontend URL (e.g. `https://kyur.vercel.app`) |
| `AWS_REGION` | Your S3 region |
| `AWS_ACCESS_KEY_ID` | Your AWS key ID |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `AWS_BUCKET_NAME` | Your S3 bucket name |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail app password |

> `PORT` is set automatically by Railway — do not add it manually.

---

## Done

Every push or PR to `main` will:
1. Run backend tests (Jest + mongodb-memory-server)
2. Lint and build the frontend
3. Deploy backend to Railway + frontend to Vercel (only on push to `main`, only if both jobs above pass)
