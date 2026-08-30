#!/usr/bin/env bash
# Deploy prod thủ công (dùng khi máy prod bị cô lập khỏi GitLab nên không deploy qua CI).
#
# Chạy trên máy prod, trong thư mục chứa repo (hoặc ít nhất docker-compose.prod.yml + .env):
#   ./scripts/deploy-prod.sh <SHA ngắn | main | vX.Y.Z>
#
# Yêu cầu trên máy prod:
#   - docker + docker compose plugin, đã `docker login registry.antadmin.com`
#   - file .env cạnh docker-compose.prod.yml (NUXT_SESSION_SECRET, NUXT_AUTH_BASE_URL, ...)
set -euo pipefail

cd "$(dirname "$0")/.."

TAG="${1:?Cách dùng: ./scripts/deploy-prod.sh <SHA ngắn | main | vX.Y.Z>}"
IMAGE="registry.antadmin.com/antadmin/__APP_NAME__"
export WEB_IMAGE="$IMAGE:$TAG"

if [ ! -f .env ]; then
  echo "Thiếu file .env cạnh docker-compose.prod.yml (xem .env.example)" >&2
  exit 1
fi

echo "==> Pull $WEB_IMAGE"
docker pull "$WEB_IMAGE"

echo "==> Up container"
docker compose -p __APP_NAME__ -f docker-compose.prod.yml up -d

echo "==> Dọn image cũ"
docker image prune -f

echo "==> Xong. Kiểm tra: docker compose -p __APP_NAME__ -f docker-compose.prod.yml ps"
