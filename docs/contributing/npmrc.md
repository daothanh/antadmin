# Cấu hình .npmrc (GitLab Registry)

Hướng dẫn chi tiết cấu hình `.npmrc` để **cài** (`@antadmin/*`) và **publish** package lên
GitLab Package Registry (`github.com`, project `antadmin/web-framework-core`, id `57`).

## Khái niệm cốt lõi

Một `.npmrc` cho registry private gồm **2 dòng**:

```ini
# 1) Scope → registry: package @antadmin lấy từ đâu
@antadmin:registry=https://github.com/api/v4/packages/npm/
# 2) authToken theo "nerf-dart" (URL không có protocol, bắt đầu bằng //)
//github.com/api/v4/packages/npm/:_authToken=${NPM_TOKEN}
```

**Quy tắc bắt buộc:**
- Dòng authToken **phải bắt đầu bằng `//`** (bỏ `http:`/`https:`). Viết `https://...:_authToken`
  hoặc `http://...:_authToken` đều **sai** → npm bỏ qua → request ẩn danh → **401**.
- Phần host/path của authToken phải **khớp** với registry đang dùng (cùng host + path).
- Token rỗng cũng cho 401 (ẩn danh). Luôn kiểm tra token có giá trị.

## Hai loại endpoint GitLab

| Mục đích | Endpoint | Quyền token |
|---|---|---|
| **Cài** (install/read) | instance-level: `…/api/v4/packages/npm/` | `read_package_registry` |
| **Publish** (write) | project-level: `…/api/v4/projects/<id>/packages/npm/` | `write_package_registry` |

> Scope `@antadmin` phải trùng **group gốc** (`antadmin`) thì instance-level mới resolve được package.

---

## A. Consumer — cài @antadmin/* (team sản phẩm)

### Dev local
Project commit sẵn `.npmrc` (CLI sinh ra):
```ini
@antadmin:registry=https://github.com/api/v4/packages/npm/
```
Token **không commit** — mỗi dev thêm vào `~/.npmrc` cá nhân:
```ini
//github.com/api/v4/packages/npm/:_authToken=<personal_access_token>
```
PAT scope `read_api` hoặc `read_package_registry`.

### CI sản phẩm (.gitlab-ci.yml)
Đặt biến CI/CD `NPM_TOKEN` (Deploy/Group token scope `read_package_registry`), rồi:
```yaml
before_script:
  - echo "//github.com/api/v4/packages/npm/:_authToken=${NPM_TOKEN}" >> .npmrc
  - pnpm install --frozen-lockfile
```

---

## B. Publish — core CI (đã cấu hình ở `.gitlab-ci.yml` root)

Publish dùng **project-level** endpoint + token **write**. Cấu hình động trong job `release`:

```yaml
release:
  before_script:
    - corepack enable
    - pnpm config set store-dir .pnpm-store
    # Cắt MỌI protocol rồi ÉP https (xem gotcha bên dưới).
    - |
      HOSTPATH="${CI_API_V4_URL#http*://}"
      echo "@antadmin:registry=https://${HOSTPATH}/projects/${CI_PROJECT_ID}/packages/npm/" >> .npmrc
      echo "//${HOSTPATH}/projects/${CI_PROJECT_ID}/packages/npm/:_authToken=${NPM_TOKEN}" >> .npmrc
    - pnpm install --frozen-lockfile
  script:
    - pnpm exec turbo run build --filter="./packages/*"
    - pnpm changeset publish
```

**Biến CI/CD cần đặt** (Settings → CI/CD → Variables):
- `NPM_TOKEN` = Deploy Token / Project Access Token scope **`write_package_registry`**.
- Cờ: **Masked** + **Protected** (release chạy trên `main` đã là protected branch).

> `.npmrc` cho `@antadmin:registry` ghi đè khi append — npm/pnpm dùng **dòng cuối cùng** cho mỗi key,
> nên dòng project-level (append) thắng dòng instance-level (commit sẵn).

---

## Gotcha thực tế (đã gặp khi release 1.0.0)

### 1. `CI_API_V4_URL` là `http://` → 401
Instance này trả `CI_API_V4_URL=http://github.com/api/v4`. Nếu cắt prefix bằng
`${CI_API_V4_URL#https:}` thì **không khớp** (`http:` ≠ `https:`) → authToken key thành
`http://…:_authToken` (sai) → token không gửi → **401**.
→ Dùng `${CI_API_V4_URL#http*://}` (cắt cả http/https) rồi **ép `https://`**.

### 2. `CI_JOB_TOKEN` bị 401 khi publish
Trên instance này, publish npm bằng `CI_JOB_TOKEN` bị từ chối. → Dùng access/deploy token
(`write_package_registry`) qua `NPM_TOKEN`.

### 3. Protected variable + protected branch
Biến đặt **Protected** chỉ lộ ra trên nhánh/tag **protected**. Đảm bảo `main` là protected branch
(đã bật), hoặc bỏ cờ Protected.

### 4. Read vs Write
Cài cần `read_package_registry`; publish cần `write_package_registry`. Dùng nhầm scope → 401/403.

---

## Troubleshooting nhanh

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `401 Unauthorized` khi publish | authToken key sai format (có `http(s):`) hoặc token rỗng/sai scope | Đảm bảo key bắt đầu `//`, ép https, token `write_package_registry` |
| `401` khi install | thiếu token / token chỉ có write | Thêm `read_package_registry` token vào `~/.npmrc`/CI |
| `404 Not Found` | sai project id / package chưa tồn tại / scope ≠ group | Kiểm tra endpoint + scope `@antadmin` khớp group `antadmin` |
| `400 ... Version has already been taken` | version đã publish | Bump version mới (changeset) |
| Token bị "nuốt" do `$` | biến CI `raw=false` + token chứa `$` | Bật cờ **Expand variable reference = off** (raw) cho biến |

### Debug an toàn trong CI (không lộ token)
```yaml
- 'echo "NPM_TOKEN length: ${#NPM_TOKEN}"'   # 0 = chưa inject
- 'grep -v "_authToken" .npmrc || true'      # xem registry, ẩn dòng token
```
