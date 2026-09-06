from app.agents.movie_agent import create_movie_agent


agent = create_movie_agent()


response = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "Find Avengers movies",
            }
        ]
    }
)


print("\n========== AGENT RESPONSE ==========\n")

print(response)

print("\n====================================\n")