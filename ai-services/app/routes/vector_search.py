from fastapi import APIRouter
from pydantic import BaseModel

from app.tools.vector_search import vector_search

router = APIRouter()


class VectorSearchRequest(BaseModel):
    query: str
    user_id: int | None = None


@router.post("/vector-search")
async def vector_search_route(request: VectorSearchRequest):

    results = vector_search.invoke({
        "query": request.query,
        "user_id": request.user_id
    })

    return {
        "results": results
    }