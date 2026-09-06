from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.agent_service import run_movie_agent

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        result = await run_movie_agent(request.message)

        # Debug: see exactly what the agent returned
        print("\n========== AGENT RESULT ==========")
        print(result)
        print("==================================\n")

        # Don't assume result["messages"] exists
        if isinstance(result, dict):
            messages = result.get("messages", [])
        else:
            messages = []

        final_response = ""
        tools_called = []

        # Inspect messages produced by the agent
        for message in messages:

            # Get final AI response
            if hasattr(message, "content") and message.content:
                content = message.content

                if isinstance(content, str):
                    final_response = content

            # Get tool calls
            if hasattr(message, "tool_calls") and message.tool_calls:
                for tool_call in message.tool_calls:
                    tool_name = tool_call.get("name")

                    if tool_name and tool_name not in tools_called:
                        tools_called.append(tool_name)

            # ToolMessage can also tell us which tool executed
            if hasattr(message, "name") and message.name:
                if message.name not in tools_called:
                    tools_called.append(message.name)

        # Fallback if the agent itself returned a response
        if not final_response and isinstance(result, dict):
            final_response = result.get("response", "")

        return {
            "response": final_response,
            "tools_called": tools_called,
        }

    except Exception as e:
        print("CHAT ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )