#!/bin/sh
# NAS에서 sudo로 직접 실행한다: sudo sh deploy.sh
# (docker.sock이 root:root 소유라 sudo가 필요 — 비밀번호는 이 스크립트를 실행하는
# 사람이 직접 입력한다.)
set -e
cd "$(dirname "$0")"

if [ ! -f .env.prod ]; then
  echo ".env.prod가 없습니다. .env.prod.example을 복사해 실제 값을 채우세요."
  exit 1
fi

STUDY_PROJECT_DIR="${STUDY_PROJECT_DIR:-/volume1/docker/StudyProject}"
if [ ! -d "$STUDY_PROJECT_DIR" ]; then
  echo "$STUDY_PROJECT_DIR 가 없습니다 — StudyProject를 여기에 clone 해두세요:"
  echo "  git clone https://github.com/noble-shake/StudyProject $STUDY_PROJECT_DIR"
  exit 1
fi

docker build -f Dockerfile.nas -t rottennoble-backend .
docker rm -f rottennoble-backend 2>/dev/null || true
docker run -d --name rottennoble-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file .env.prod \
  -v "$STUDY_PROJECT_DIR:/data/study-project:ro" \
  rottennoble-backend

echo "기동 확인: curl http://localhost:8080/api/health"
