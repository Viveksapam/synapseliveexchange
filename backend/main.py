from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import verisphere, portfolio, project, auth, activity

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
