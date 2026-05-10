#!/bin/bash

ollama serve &

until ollama list >/dev/null 2>&1; do
  sleep 2
done

ollama pull llama3.2:1b

wait