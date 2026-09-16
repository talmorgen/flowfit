FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY sync.py cloud_service.py ./
EXPOSE 10000
CMD ["sh", "-c", "uvicorn cloud_service:app --host 0.0.0.0 --port ${PORT:-10000}"]
