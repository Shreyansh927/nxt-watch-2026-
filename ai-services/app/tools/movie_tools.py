from langchain_core.tools import tool
from app.db import get_connection


@tool
def search_movies(query: str) -> list:
    """
    Search movies by title, description, genre, director, or actors.
    Use this tool when the user asks to find movies.
    """

    sql = """
        SELECT
            id,
            title,
            posterpath,
            backdroppath,
            release_year,
            genre,
            description,
            director,
            actors
        FROM movies
        WHERE
            title ILIKE %s
            OR description ILIKE %s
            OR genre ILIKE %s
            OR director ILIKE %s
            OR actors ILIKE %s
        LIMIT 10;
    """

    search_pattern = f"%{query}%"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                    search_pattern,
                ),
            )

            rows = cur.fetchall()

            columns = [desc.name for desc in cur.description]

            return [
                dict(zip(columns, row))
                for row in rows
            ]