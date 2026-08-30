---
"@antadmin/cli": minor
---

Scaffold thêm CI/CD deploy đầy đủ, dựa trên hạ tầng Docker + GitLab Runner shell
executor đã triển khai thực tế cho một sản phẩm AntAdmin: `Dockerfile` đa stage
(check/build/runtime), `docker-compose.yml`/`docker-compose.dev.yml`/
`docker-compose.prod.yml`, `scripts/deploy-prod.sh`, `.dockerignore`, và
`.gitlab-ci.yml` mới (stage check → build → deploy, tự deploy nhánh `dev` lên máy
dev, prod deploy thủ công qua script). Thêm script `check` (lint+typecheck) vào
`package.json` scaffold. Docs: mục mới [CI/CD & Deploy](/guide/deploy).
