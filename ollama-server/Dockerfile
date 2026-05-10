FROM ollama/ollama

WORKDIR /app

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 11434

HEALTHCHECK CMD ollama list || exit 1

ENTRYPOINT ["/bin/bash", "/start.sh"]