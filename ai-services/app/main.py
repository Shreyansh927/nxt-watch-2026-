from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()
from fastapi import FastAPI

from app.routes.chat import router as chat_router
from app.routes.recommend import router as recommend_router

from app.routes.vector_search import router as vector_search_router
from app.routes.similar_movies import router as similar_movies_router




app = FastAPI(
    title="Nxt-Watch AI Service",
    description="AI/ML service for Nxt-Watch",
    version="1.0.0",
)


# Register AI routes
app.include_router(
    chat_router,
    prefix="/api/ai",
    tags=["AI Chat"],
)

app.include_router(
    recommend_router,
    prefix="/api/ai",
    tags=["Recommendations"],
)


app.include_router(
    vector_search_router,
    prefix="/api/ai",
    tags=["Vector Search"],
)

app.include_router(
    similar_movies_router,
    prefix="/api/ai",
    tags=["Similar movies Search"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "nxt-watch-ai",
    }