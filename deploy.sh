#!/bin/bash
set -e

SERVER="next@87.248.153.199"
DEST_PATH="/home/next/apps/vendora"
IMAGE_NAME="vendora"
TAG="latest"
CONTAINER_NAME="vendora-app"
TARGET_PORT="3082"
ARCHIVE_NAME="vendora.tar.gz"

echo "============================================="
echo " 🚀 Building VENDORA locally with pnpm"
echo "============================================="

echo "-> Building Next.js Standalone..."
pnpm run build

echo "-> Packaging into lightweight Docker image (Debian Slim)..."
docker build -t ${IMAGE_NAME}:${TAG} .

echo "-> Compressing Docker image to ${ARCHIVE_NAME}..."
docker save ${IMAGE_NAME}:${TAG} | gzip -1 > ${ARCHIVE_NAME}

echo "-> Ensuring remote directory exists..."
ssh ${SERVER} "mkdir -p ${DEST_PATH}"

echo "-> Transferring image archive to server..."
scp ${ARCHIVE_NAME} ${SERVER}:${DEST_PATH}/

echo "-> Cleaning up local archive..."
rm -f ${ARCHIVE_NAME}

echo "============================================="
echo " 🌐 Deploying VENDORA on Server (Port ${TARGET_PORT})"
echo "============================================="

ssh ${SERVER} << EOF
set -e
cd ${DEST_PATH}

echo "-> Loading Docker image on server..."
docker load -i ${ARCHIVE_NAME}
rm -f ${ARCHIVE_NAME}

echo "-> Stopping existing container if running..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm -f ${CONTAINER_NAME} 2>/dev/null || true

echo "-> Starting new container on port ${TARGET_PORT}..."
if [ -f .env.production ]; then
  docker run -d \
    --name ${CONTAINER_NAME} \
    --restart always \
    -p ${TARGET_PORT}:3000 \
    --memory 1.5g \
    --cpus 1.5 \
    --env-file .env.production \
    ${IMAGE_NAME}:${TAG}
else
  docker run -d \
    --name ${CONTAINER_NAME} \
    --restart always \
    -p ${TARGET_PORT}:3000 \
    --memory 1.5g \
    --cpus 1.5 \
    -e NODE_ENV="production" \
    ${IMAGE_NAME}:${TAG}
fi

echo "-> Cleaning up dangling images..."
docker image prune -f

echo "-> Verifying container health..."
sleep 4
if [ "\$(docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME})" == "true" ]; then
    echo "✅ Success: VENDORA is live on port ${TARGET_PORT}!"
else
    echo "❌ Deployment error: Container failed to stay alive. Logs:"
    docker logs ${CONTAINER_NAME}
    exit 1
fi
EOF

echo "============================================="
echo " 🎉 VENDORA Deployment Completed Successfully!"
echo "============================================="