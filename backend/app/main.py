"""Application FastAPI : configure CORS et branche les routers."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

app = FastAPI(title="piver — Event Tracking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Sonde simple pour vérifier que l'API répond."""
    return {"status": "ok"}
