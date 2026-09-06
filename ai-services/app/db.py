import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

MOVIE_DB_URL = os.getenv("MOVIE_DB_URL")


def get_connection():
    if not MOVIE_DB_URL:
        raise RuntimeError("MOVIE_DB_URL is not configured")

    return psycopg.connect(MOVIE_DB_URL)