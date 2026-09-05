# Bootstrap npmjs lần đầu

Runbook này chỉ dùng khi chín package public AntAdmin chưa tồn tại trên npmjs. Release thường ngày
luôn đi qua trusted publishing trong GitHub Actions, không dùng token npm.

## Điều kiện trước khi thao tác

1. Merge thay đổi release và kiểm tra `pnpm install --frozen-lockfile`, `pnpm lint`,
   `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm test:release` đều pass.
2. Xác nhận đúng chín package public và `@antadmin/mcp` vẫn private.
3. Tài khoản `daothanh` sở hữu organization npm `antadmin` và 2FA đã bật cho organization.
4. Tạo GitHub Environment `npm-production` với required reviewer.

## Claim tên package

npm chỉ cho cấu hình trusted publisher sau khi package đã tồn tại. Tạo một granular token có quyền
publish tối thiểu, expiry ngắn, rồi publish từng package với version placeholder
`0.0.0-bootstrap.0` và dist-tag `bootstrap`. Placeholder chỉ chứa `package.json`, README và MIT
license; không publish source release bằng token.

Sau mỗi lần publish, xác nhận placeholder không là `latest`:

```bash
npm view @antadmin/<package> dist-tags
```

Không commit token, không thêm token vào GitHub Actions và thu hồi ngay sau bước kế tiếp.

## Cấu hình trusted publisher

Trên npmjs.com, mở Settings của từng package public và thêm trusted publisher:

- GitHub owner: `daothanh`
- Repository: `antadmin`
- Workflow filename: `release.yml`
- Environment: `npm-production`
- Allowed action: `npm publish`

Sau khi đủ chín package được cấu hình, thu hồi granular token. Thiết lập Publishing access của từng
package thành “Require two-factor authentication and disallow tokens”.

## Publish và hậu kiểm

Merge version `1.3.0`, approve environment `npm-production`, sau đó theo dõi workflow Release. OIDC
phải là đường publish duy nhất; nếu lỗi xác thực, sửa thông tin trusted publisher và rerun workflow,
không tạo fallback token.

Kiểm tra mỗi package public:

```bash
npm view @antadmin/<package>@1.3.0 version license dist-tags repository
```

Kết quả yêu cầu: version `1.3.0`, `latest` trỏ tới `1.3.0`, license MIT và provenance hiển thị trên
npmjs. `npm view @antadmin/mcp` phải trả về 404.
