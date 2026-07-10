# Use an official lightweight Python image
FROM python:3.10-slim

# Set python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Set working directory inside the container
WORKDIR /app

# Install compilation tools for dependency building
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source files into the container
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start server using uvicorn on all interfaces
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
