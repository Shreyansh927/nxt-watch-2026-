from app.tools.movie_tools import search_movies


if __name__ == "__main__":
    result = search_movies.invoke("Avengers")

    print("Search results:")
    print(result)