FROM python:3.11-slim

# Install system dependencies and FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Ensure downloads directory exists
RUN mkdir -p /app/downloads && chmod 777 /app/downloads

# Expose default port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${APP_PORT:-8080}/ || exit 1

# Start Uvicorn application
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-${APP_PORT:-8080}}"]
