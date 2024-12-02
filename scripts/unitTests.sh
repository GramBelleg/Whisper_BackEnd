#!/bin/bash
docker network create test-network

docker run --name redis --network test-network -p 6379:6379 -d redis

echo "Waiting for Redis to be ready..."
sleep 1

echo "Running tests..."
docker run --rm \
    --network test-network \
    -v "$JOB_PATH:/app" -w /app \
    --env-file .env.test \
    node:18 /bin/bash -c \
    "npm run migrate:deploy && npx prisma generate && npm run test; exit" > testsLogs.txt 2>&1

echo "Tests completed. Cleaning up..."
docker rm -f redis
docker network rm -f test-network

