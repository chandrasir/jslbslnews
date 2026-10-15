# जनउत्थान सामुदायिक लघुवित्त — News Website

Modern, responsive (mobile + desktop) news & notice website with a password‑protected
**/admin** panel. News added in `/admin` appears on the public site immediately.

- **Stack:** Next.js 14 (App Router) · Upstash Redis (storage) · plain CSS (green + orange theme)
- **Public pages:** `/` (home) · `/news` (all, with category filter) · `/news/<id>` (article)
- **Admin:** `/admin` — login, add / edit / delete news, upload a photo or paste an image link

## Visitor submissions (with your approval)

- Visitors open **/submit**, fill in name, title, details and an optional photo, and send it.
- Nothing is published automatically. In **/admin → "स्वीकृति प्रतीक्षामा"** you can
  **approve**, **review/edit then approve**, or **reject** each submission.
- Approved items appear on the site immediately; the submitter's name is shown only if they agreed.
  Their phone/email is visible to you in the admin panel only.
- Spam protection: hidden honeypot field, max 5 submissions per hour per visitor, max 100 pending items.

## Deploy (GitHub + Vercel, all in the browser)

1. Create a new **GitHub repository**, then upload all files of this project
   (GitHub → *Add file → Upload files*). Commit.
2. Go to **vercel.com → Add New → Project**, import that repository, click **Deploy**.
3. In the Vercel project: **Storage → Create Database → Upstash Redis** (free plan) → connect it to the project.
   This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Settings → Environment Variables**, add:
   - `ADMIN_PASSWORD` = your strong admin password
   - `ADMIN_SECRET` = any long random text
5. **Deployments → ⋯ → Redeploy** so the variables take effect.
6. Open `https://<your-site>.vercel.app/admin`, log in, and post your first news.

## Run locally (optional)

```bash
npm install
cp .env.example .env.local   # edit values
npm run dev                  # http://localhost:3000
```

Without Redis variables the site still runs locally, but posts are kept in memory only.
