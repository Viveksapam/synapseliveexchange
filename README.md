# Synapse Live Exchange (Synapse LE)

**Verifiable by Design.** A portfolio platform for source-backed discussion, credential verification, and spatial learning — built as a mono-repo (React + FastAPI + PostgreSQL).

---

## What It Is

Synapse LE is a set of connected web applications designed around the principle that every claim should carry its source and every credential should be instantly verifiable. Built and maintained by [Sapam Vivek Singh](https://www.linkedin.com/in/sapam-singh/).

**Live Applications (v4.02)**

| App | Description | Route |
|-----|-------------|-------|
| **Verisphere** | Community platform for verifiable, source-backed discourse | `/verisphere` |
| **Credential Assessment System (CAS)** | Issue and verify tamper-evident academic credentials | `/credentials` |
| **Spatial Learning Environment (SLE)** | Interactive 3D course map using Three.js / React Three Fiber | `/sle` |
| **Merchandise** | SLE-branded physical goods store | `/shop` |

---

## Architecture

```
sle/
├── frontend/          # React (Vite), plain CSS, no TypeScript
│   ├── src/
│   │   ├── pages/     # Route-level components (Home, Verisphere, etc.)
│   │   ├── api/       # Fetch wrappers for backend endpoints
│   │   ├── data/      # Static/legacy data (legacyLinks.js)
│   │   └── templates/ # DC Logic design variants (Classic, Editorial, Minimal)
├── backend/           # FastAPI, SQLAlchemy, Neon PostgreSQL
│   ├── models/        # ORM models (user, blog, portfolio, project)
│   ├── routers/       # Route handlers (auth, portfolio, project, activity)
│   ├── seed_db.py     # Canonical seed for skills, videos, projects, blogs
│   └── migrate_db.py  # Custom SQL migrations (no Alembic)
```

**Tech Stack**

- Frontend: React 18, React Router, plain CSS (CSS Modules + BEM), Material Symbols
- Backend: FastAPI, SQLAlchemy, Pydantic v2, JWT authentication
- Database: Neon PostgreSQL (production), SQLite (local dev)
- 3D: Three.js, React Three Fiber, Drei
- Hosting: Vercel (frontend), Render / Railway (backend)

---

## Database Schema (10 tables)

**Auth** — `user_usermodel`

**Portfolio** — `portfolio_skillmodel`, `portfolio_videomodel`, `project_projectmodel`

**Blog / Community** — `blog_communitymodel`, `blog_blogmodel`, `blog_blogaianalysismodel`, `blog_blogcommentmodel`, `blog_featuredblogmodel`, `blog_postreactionmodel`

---

## Getting Started

**Backend**
```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env                           # set DATABASE_URL
python init_db.py                              # create tables
python seed_db.py                              # seed content
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                                    # localhost:5173
```

---

## Design System

The homepage uses a custom design language (`ath-*` CSS class prefix). Three alternative homepage designs are available as reference in [`frontend/src/templates/`](frontend/src/templates/) — Classic (serif/earthy), Editorial (bold/journalistic), Minimal (modern/clean).

Accessibility target: **WCAG 2.1 AA**.

---

## Progress

- [x] Mono-repo setup and initial commit
- [x] FastAPI backend with JWT auth, portfolio and blog routes
- [x] React homepage with capability carousel, project directory, spotlight, merchandise sections
- [x] Neon PostgreSQL integration with full seed data (skills with SVG icons, videos, projects, blogs)
- [x] Three DC Logic design variants documented in `/templates`
- [x] WCAG 2.1 AA accessible markup
- [ ] Verisphere community features (posts, reactions, AI analysis)
- [ ] CAS credential issuance and verification flow
- [ ] SLE 3D spatial map
- [ ] Production deployment

---

## Contact

LinkedIn: [/in/sapam-singh](https://www.linkedin.com/in/sapam-singh/) · GitHub: [/Viveksapam](https://github.com/Viveksapam) · Email: Viveksapamofficial@outlook.com

© 2026 Synapse LE. Verifiable by Design.
