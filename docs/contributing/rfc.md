# RFC Process

Khi team sản phẩm cần một tính năng/đổi thay ở **core** (tránh fork), mở một RFC để core team
và các stakeholder thống nhất trước khi implement.

Chỉ có ý tưởng, chưa muốn/chưa thể tự viết RFC hay code? Mở issue theo template
**"Feature Request"** thay vì RFC — xem [Cơ chế Feature Request](#cơ-chế-feature-request-nhẹ)
bên dưới.

## 3 tầng đóng góp

| Tầng | Định nghĩa | Cần RFC? |
|---|---|---|
| **T1 — Fix nhỏ/nội bộ** | Bug fix, không đổi public API, không ảnh hưởng team khác | Không, mở MR thẳng |
| **T2 — Feature mới, không breaking** | Thêm API/component/composable mới | Khuyến nghị nếu ảnh hưởng ≥2 team hoặc thêm public API |
| **T3 — Breaking/đổi API công khai** | Đổi/xoá public API, đổi hành vi mặc định | **Bắt buộc**, phải `Accepted` trước khi mở MR implement |

## Khi nào cần RFC

- Thêm/đổi API công khai của `@antadmin/*` (composable, component, layer config).
- Thay đổi ảnh hưởng nhiều team sản phẩm.
- Breaking change.

Sửa nhỏ, bug fix, nội bộ một sản phẩm → **không** cần RFC, mở MR thẳng (dùng MR template mặc định
tại `.gitlab/merge_request_templates/Default.md`).

## Tiêu chí "core-worthy" — dùng khi triage feature request hoặc duyệt RFC

Trả lời được **< 3/5 câu "Có"** bên dưới → khuyến nghị giữ lại ở repo sản phẩm, chỉ core hoá phần
thật sự dùng chung (ví dụ: core giữ `useTable` generic, sản phẩm tự viết `useOrderTable` wrap nó).

1. Có ≥2 team sản phẩm hiện tại/sắp tới cần đúng hành vi này (không phải "có thể hữu ích sau này")?
2. API/component diễn đạt được mà KHÔNG chứa tên nghiệp vụ riêng của 1 sản phẩm?
3. Không phá vỡ ràng buộc dependency đã cố định (`composables` không phụ thuộc `ui`, `utils`
   không phụ thuộc Nuxt, tối đa 2 tầng layer)?
4. Test/story viết được độc lập, không cần mock API riêng của 1 sản phẩm?
5. Chi phí bảo trì lâu dài (thêm 1 API công khai = cam kết backward-compat) hợp lý so với lợi ích?

## Quy trình

1. Copy mẫu bên dưới vào `docs/rfcs/NNNN-ten-ngan.md` (NNNN tăng dần — xem
   [index hiện có](../rfcs/README.md)), thêm 1 dòng vào bảng index trong cùng MR.
2. Mở Merge Request gắn nhãn `rfc` (dùng MR template tại
   `.gitlab/merge_request_templates/RFC.md`).
3. Thảo luận tối thiểu 1 tuần (hoặc tới khi đồng thuận).
4. Core team duyệt → `Accepted`/`Rejected`. Accepted thì lên lộ trình release, mở MR implement
   riêng link ngược lại RFC.

## Cơ chế Feature Request nhẹ

Cho người chỉ có ý tưởng, không tự viết RFC/code: mở issue theo template `feature_request`
(`.gitlab/issue_templates/feature_request.md`).

Core team **triage hàng tuần** (đầu tuần) toàn bộ issue `feature_request` chưa có outcome, MR gắn
nhãn `rfc` đang Draft quá 1 tuần chưa phản hồi, và MR T2/T3 chờ approval > 3 ngày làm việc. Mỗi
feature request được gắn 1 trong 3 label:

- `status::needs-rfc` — ý tưởng đủ lớn, nâng thành RFC (issue link vào RFC MR rồi close).
- `status::good-first-contribution` — đủ nhỏ, rõ ràng, ai cũng nhận làm được (T1/T2 MR thẳng).
- `status::declined` — không đạt tiêu chí core-worthy ở trên, giữ lại ở repo sản phẩm.

## Mẫu RFC

```md
# RFC NNNN: <Tiêu đề>

- Trạng thái: Draft | Accepted | Rejected
- Người đề xuất: <tên, team>
- Ngày: YYYY-MM-DD

## Bối cảnh & vấn đề
Vấn đề đang gặp, vì sao cần giải quyết ở core.

## Đề xuất
Giải pháp cụ thể: API, hành vi, ví dụ dùng.

## Phương án thay thế
Các hướng khác đã cân nhắc và lý do không chọn.

## Ảnh hưởng
- Breaking? Migration?
- Package nào bị ảnh hưởng.

## Câu hỏi mở
Những điểm chưa chốt.
```
