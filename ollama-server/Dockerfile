FROM ollama/ollama

WORKDIR /app

RUN ollama serve & sleep 20 && ollama pull llama3.2:3b

COPY start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 11434

ENTRYPOINT ["/bin/bash", "/start.sh"]