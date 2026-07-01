import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import verisphere, portfolio, project, auth, activity
from database import engine
from models import blog_models, portfolio_models, user_models
from core.config import settings

blog_models.Base.metadata.create_all(bind=engine)
portfolio_models.Base.metadata.create_all(bind=engine)
user_models.Base.metadata.create_all(bind=engine)

# Print the AI mode this process booted with. Because pydantic Settings reads
# env vars ONCE at startup, this line is the source of truth for whether THIS
# running process will call real Gemini or return mock data - editing .env
# after boot changes nothing until the process is restarted.
_log = logging.getLogger("uvicorn.error")
_log.info(
    "[STARTUP] AI audit mode: %s%s",
    "MOCK (USE_MOCK_LLM=True)" if settings.USE_MOCK_LLM else "REAL GEMINI (USE_MOCK_LLM=False)",
    "" if settings.USE_MOCK_LLM else (" — API key present" if settings.GEMINI_API_KEY else " — WARNING: GEMINI_API_KEY is EMPTY"),
)

app = FastAPI(title="Synapse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://192.168.1.35:5173", "https://synapseislive.com", "https://www.synapseislive.com", "https://synapseliveexchange.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(verisphere.router)
app.include_router(portfolio.router)
app.include_router(project.router)
app.include_router(activity.router)

@app.get("/")
def root():
    return {"message": "Welcome to Synapse-LE FastAPI Backend!"}
