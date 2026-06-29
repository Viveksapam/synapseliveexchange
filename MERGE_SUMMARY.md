# Merge Summary — Design Copy → Codebase Business Logic

All files below are at their **exact repo-relative paths** under `codebase-merge/`.
Copy each one over the matching file in your real repo, then follow the run steps.

---

## 1. Files changed

### Backend
| File | What changed |
|---|---|
| `backend/seed_db.py` | **Rewritten.** Seeds 6 capabilities **with icon SVGs** (fixes the ath-carousel icons), moves the 4 Spotlight **videos into the `portfolio_videomodel` table (links preserved)**, seeds the 3 on-brand projects, and inserts + features the 3 homepage blog contributions. |
| `backend/.env.example` | **New.** Safe template documenting `DATABASE_URL` + `SECRET_KEY` as sensitive — no real credentials. |

### Frontend
| File | What changed |
|---|---|
| `src/pages/Home/components/HomeHero.jsx` | **Words only**, structure untouched. Eyebrow → `SYNAPSE LIVE EXCHANGE — V4.02`; meta labels → `What It's For` / `At A Glance`; copy updated to the verifiable-discovery voice. |
| `src/pages/Home/components/SpotlightSection.jsx` | Now **fetches videos from the DB** (`fetchVideoList`) instead of a hardcoded array. Falls back to `legacyVideos` so it renders instantly and never breaks if the API is down. |
| `src/pages/Home/components/HomeFooter.jsx` | Copyright → `Verifiable by Design.` + a **Connect** row (LinkedIn / GitHub / Email) pulled from `src/data/legacyLinks.js` so the real links are surfaced, not just stored. |

---

## 2. The "ath-carousel icons" database connection

The connection already existed and is now fully wired:

- **DB:** `SkillModel.strIconSvg` (Text) holds raw SVG markup.
- **API:** `GET /api/portfolio/skills/` → `crud_portfolio.get_skills`.
- **Frontend:** `CapabilitiesCarousel.jsx` renders `skill.strIconSvg` via `dangerouslySetInnerHTML`, and falls back to a Material Symbol when empty.

The reason icons weren't showing is that the DB only had 2 skills seeded with icons. The new `seed_db.py` seeds **all 6 capabilities with proper icon SVGs**, so the carousel and the skill modal both light up.

## 3. Videos "made into a table with the links"

The links were hardcoded in the component; the `portfolio_videomodel` table existed but was nearly empty. Now the **4 real YouTube links are seeded as rows** (titles/descriptions kept exactly — I did **not** rename them to the design's mock titles, since the links play the real videos). The Spotlight section reads them from the table.

---

## 4. How to apply (with both servers running)

```bash
# From backend/, with your venv active and .env pointing at Neon:
python seed_db.py
```
Then hard-refresh `localhost:5173`. Frontend `.jsx` changes hot-reload as soon as you save the files over the originals.

**Heads-up on the seed:**
- `Skills`, `Videos`, `Projects` tables are **reset and re-seeded** (they hold no user data).
- `Blogs` is **non-destructive** — it only inserts the 3 contributions if missing and resets the *Featured* join to point at them. No blog/comment/reaction/community data is deleted.

---

## 5. Security — moving the password safe ⚠️

I can't rotate the credential for you (it lives in the Neon console), but here's the safe path:

1. **Rotate the Neon password now** — Neon Console → your project → *Roles* → reset password for `neondb_owner` (it was shared in plaintext in `backend/.env`, so treat it as compromised).
2. Put the **new** connection string only in `backend/.env` (already git-ignored — confirmed in the root `.gitignore`).
3. Commit `backend/.env.example` (the safe template included here) so teammates know which vars exist without seeing secrets.
4. Generate a fresh `SECRET_KEY`: `openssl rand -hex 32`.

---

## 6. Left untouched on purpose (flag for you)

- **Merchandise** (`src/data/merchandiseData.js`): the design exploration showed a notebook / sticker / bottle set, but your codebase ships 3 black tees with real product images. Per "keep the images," I left the tees as-is. Say the word if you want the notebook/sticker/bottle copy instead.
- **Section eyebrows** like "The Marginalia" / "The Marginalia Shop" — kept, as they read as intentional brand voice rather than edited copy.
- **Hero structure** — unchanged, as requested. Words only.
