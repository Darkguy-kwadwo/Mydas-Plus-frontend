# Mydas Plus

Monorepo with separately deployable frontend and backend.

```
property-listing-website/
├── frontend/          # Next.js (Vercel)
└── poperty-backend/   # Django (Render) — also its own git repo (ignored here)
```

## Frontend (local)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Env (local fast): `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`

Staff admin UI: `/login` then `/dashboard` (staff/superuser only). Django admin remains at `/admin/`.

### Vercel

1. **Root Directory:** `frontend`
2. Framework: **Next.js**
3. Build: `npm run build` (default)
4. Env: `NEXT_PUBLIC_API_URL=https://poperty-listing-backend.onrender.com/api`

Then redeploy.

Deployed: https://mydas-plus-frontend.vercel.app

## Backend (local)

```bash
cd poperty-backend
source .env/bin/activate   # or python3 -m venv .env && pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000
```

### Render

Deploy from the **backend** repo (`Mydas-Plus-backend`), not this frontend repo.

1. Root Directory: leave empty (repo root of the backend service)
2. Build: `pip install -r requirements.txt`
3. Start: `bash start.sh`  (migrates, seeds if empty, then gunicorn)
4. Env (example in `poperty-backend/.env.example`):
   - `DJANGO_SECRET_KEY`
   - `DJANGO_DEBUG=false`
   - `DJANGO_ALLOWED_HOSTS=poperty-listing-backend.onrender.com`
   - `CORS_ALLOW_ALL_ORIGINS=false`
   - `CORS_ALLOWED_ORIGINS=https://mydas-plus-frontend.vercel.app,http://localhost:3000`
   - `CSRF_TRUSTED_ORIGINS=https://mydas-plus-frontend.vercel.app,https://poperty-listing-backend.onrender.com`

**Note:** If you set `CORS_ALLOWED_ORIGINS` on Render, it overrides the defaults in `settings.py` — keep the Vercel URL in that env value.
