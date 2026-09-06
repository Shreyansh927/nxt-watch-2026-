from app.db import get_connection


if __name__ == "__main__":
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW();")
                result = cur.fetchone()

                print("✅ Database connected successfully!")
                print("🕒 Database time:", result[0])

    except Exception as e:
        print("❌ Database connection failed:")
        print(e)