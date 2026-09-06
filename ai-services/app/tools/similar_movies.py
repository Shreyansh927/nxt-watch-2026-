from langchain_core.tools import tool

from app.db import get_connection


@tool
def similar_movies(movie_id: int):
    """
    Find movies that are semantically similar to a given movie.

    Use this when the user wants movies similar to a specific movie.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Get the selected movie's embedding
        cursor.execute(
            """
            SELECT vector_embedding
            FROM movies
            WHERE id = %s
            """,
            (movie_id,)
        )

        movie = cursor.fetchone()

        if not movie:
            return {
                "error": "Movie not found"
            }

        movie_vector = movie[0]

        if movie_vector is None:
            return {
                "error": "Movie does not have an embedding"
            }

        # Find similar movies
        cursor.execute(
            """
            SELECT
                id,
                title,
                posterpath,
                backdroppath,
                release_year,
                (1 - (vector_embedding <-> %s)) * 100
                    AS match_percent
            FROM movies
            WHERE
                vector_embedding IS NOT NULL
                AND id != %s
            ORDER BY vector_embedding <-> %s
            LIMIT 10
            """,
            (
                movie_vector,
                movie_id,
                movie_vector,
            )
        )

        rows = cursor.fetchall()

        results = []

        for row in rows:
            results.append({
                "id": row[0],
                "title": row[1],
                "posterpath": row[2],
                "backdroppath": row[3],
                "release_year": row[4],
                "match_percent": float(row[5])
                if row[5] is not None
                else None,
            })

        return results

    except Exception as e:
        print("SIMILAR MOVIES ERROR:", repr(e))

        return {
            "error": "Failed to find similar movies"
        }

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()