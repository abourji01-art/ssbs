FROM python:3.11-slim

# Python optimizations
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy entrypoint to root of image
COPY entrypoint.sh /entrypoint.sh

# Fix permissions and line endings (Mac/Linux compatibility)
RUN chmod +x /entrypoint.sh && \
    sed -i 's/\r$//' /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
