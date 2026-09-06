import os

from langchain_core.tools import tool
from google import genai

from app.db import get_connection


# Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_embedding(text: str):
    """
    Generate a 3072-dimensional embedding using Gemini.
    """

    try:
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )

        embedding = response.embeddings[0].values

        if not embedding:
            return None

        embedding = [float(value) for value in embedding]

        return embedding

    except Exception as error:
        print("Gemini embedding error:", error)
        return None


@tool
def vector_search(
    query: str,
    user_id: int | None = None
):
    """
    Perform semantic movie search using Gemini embeddings
    and PostgreSQL pgvector.
    """

    if not query:
        return {
            "error": "Search query is required"
        }

    print("VECTOR SEARCH")
    print("Query:", query)
    print("User ID:", user_id)

    query_embedding = generate_embedding(query)

    if not query_embedding:
        return {
            "error": "Embedding generation failed"
        }

    vector = "[" + ",".join(
        str(value) for value in query_embedding
    ) + "]"

    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    posterpath,
                    backdroppath,
                    release_year,
                    genre,
                    description,
                    director,
                    actors,
                    vector_embedding <-> %s::vector AS distance
                FROM movies
                WHERE vector_embedding IS NOT NULL
                ORDER BY distance
                LIMIT 10
                """,
                (vector,),
            )

            rows = cursor.fetchall()

            columns = [
                description[0]
                for description in cursor.description
            ]

            results = [
                dict(zip(columns, row))
                for row in rows
            ]

            return results

    except Exception as error:
        print("Vector search error:", error)

        return {
            "error": "Vector search failed"
        }

    finally:
        conn.close()
    """
    Perform semantic movie search using Gemini embeddings
    and PostgreSQL pgvector.
    """

    if not query:
        return {
            "error": "Search query is required"
        }

    # ---------------------------------
    # Generate query embedding
    # ---------------------------------

    query_embedding = generate_embedding(query)

    if not query_embedding:
        return {
            "error": "Embedding generation failed"
        }

    # PostgreSQL vector format:
    # [0.12,0.34,0.56,...]

    vector = "[" + ",".join(
        str(value) for value in query_embedding
    ) + "]"

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    posterpath,
                    backdroppath,
                    release_year,
                    genre,
                    description,
                    director,
                    actors,

                    vector_embedding <-> %s::vector
                    AS distance

                FROM movies

                WHERE vector_embedding IS NOT NULL

                ORDER BY distance

                LIMIT 10
                """,
                (vector,),
            )

            rows = cursor.fetchall()

            columns = [
                description[0]
                for description in cursor.description
            ]

            results = [
                dict(zip(columns, row))
                for row in rows
            ]

            return results

    except Exception as error:

        print("Vector search error:", error)

        return {
            "error": "Vector search failed"
        }

    finally:
        conn.close()