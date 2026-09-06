from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.tools.similar_movies import similar_movies

router = APIRouter()


class SimilarMoviesRequest(BaseModel):
    movieId: int


@router.post("/similar-movies")
async def vector_search_route(request: SimilarMoviesRequest):

    try:
        results = similar_movies.invoke({
            "movie_id": request.movieId
        })

        return {
            "results": results
        }

    except Exception as e:
        print("SIMILAR MOVIES ROUTE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )