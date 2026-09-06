from fastapi import APIRouter

router = APIRouter()


@router.get("/recommend")
async def recommend():
    return {
        "results": []
    }