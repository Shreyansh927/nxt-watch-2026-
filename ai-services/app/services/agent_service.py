from app.agents.movie_agent import create_movie_agent

agent = create_movie_agent()


async def run_movie_agent(message: str):

    result = await agent.ainvoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": message,
                }
            ]
        }
    )

    return result