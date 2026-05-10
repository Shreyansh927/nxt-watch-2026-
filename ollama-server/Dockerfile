FROM ollama/ollama

WORKDIR /app

RUN ollama serve & \
    sleep 20 && \
    ollama pull llama3.2:1b

COPY start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 11434

HEALTHCHECK CMD ollama list || exit 1

ENTRYPOINT ["/bin/bash", "/start.sh"]