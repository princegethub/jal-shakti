#!/bin/bash

# Create Docker network if it doesn't exist
docker network create jal-shakti-network 2>/dev/null || true

echo "Creating Docker volume for logs..."
# Create a named volume for logs
docker volume create jal-shakti-logs 2>/dev/null || true

echo "Ensuring no previous container is running..."
# Stop and remove existing container if it exists
docker rm -f jal-shakti-backend 2>/dev/null || true

echo "Starting container..."
# Run the container
docker run -d \
  --name jal-shakti-backend \
  --network jal-shakti-network \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e MONGODB_URL="mongodb://prince:prince@host.docker.internal:27017/jal-shakti?authSource=admin" \
  -e JWT_SECRET="your_jwt_secret" \
  -e JWT_ACCESS_EXPIRATION_MINUTES=30 \
  -e JWT_REFRESH_EXPIRATION_DAYS=30 \
  -e JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10 \
  -e JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10 \
  -e LOG_DIR="/var/log/jal-shakti/logs" \
  -e LOG_APP_NAME="jal-shakti" \
  -e APP_ENV="production" \
  -e DEFAULT_PASSWORD="jal-shakti@123" \
  --mount type=volume,source=jal-shakti-logs,target=/var/log/jal-shakti/logs \
  --add-host=host.docker.internal:host-gateway \
  jal-shakti-backend

echo "Waiting for container to start..."
# Wait a few seconds for the container to start
sleep 3

echo "Container status:"
# Check if container is running
docker ps | grep jal-shakti-backend

echo "Container logs:"
# Show logs
docker logs jal-shakti-backend
