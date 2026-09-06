import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent

from app.tools.movie_tools import search_movies
from app.tools.vector_search import vector_search
from app.tools.similar_movies import similar_movies


def create_movie_agent():

    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        api_key=os.getenv("GEMINI_API_KEY"),
    )

    tools = [
        search_movies,
        vector_search,
        similar_movies
    ]

    system_prompt = """
You are Nxt-Watch's AI movie assistant.

You help users discover movies.

Use search_movies when the user is looking for
specific movie information or title-based searches.

Use vector_search when the user describes a movie
concept, theme, vibe, story, genre, or type of movie
and semantic similarity would be useful.

Do not invent movie information.

Give concise and useful answers.
"""

    agent = create_agent(
        model=model,
        tools=tools,
        system_prompt=system_prompt,
    )

    return agent