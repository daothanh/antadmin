<!-- Dùng template này cho MR gắn nhãn `rfc` (mở RFC theo docs/contributing/rfc.md).
     MR này review NỘI DUNG ĐỀ XUẤT, không phải code — không cần checklist changeset/test. -->

## RFC: <Tiêu đề>

- File: `docs/rfcs/NNNN-ten-ngan.md`
- Trạng thái đề xuất: Draft

## Tóm tắt

<!-- 2-3 câu: vấn đề gì, giải pháp gì. -->

## Tiêu chí core-worthy (tự đánh giá)

- [ ] Có ≥2 team sản phẩm hiện tại/sắp tới cần đúng hành vi này.
- [ ] API/component diễn đạt được mà KHÔNG chứa tên nghiệp vụ riêng của 1 sản phẩm.
- [ ] Không phá vỡ ràng buộc dependency đã cố định (`composables` không phụ thuộc `ui`, `utils`
      không phụ thuộc Nuxt, tối đa 2 tầng layer).
- [ ] Test/story viết được độc lập, không cần mock API riêng của 1 sản phẩm.
- [ ] Chi phí bảo trì lâu dài (API công khai = cam kết backward-compat) hợp lý so với lợi ích.

<!-- Trả lời được <3/5 câu → cân nhắc giữ lại ở repo sản phẩm thay vì đưa vào core. -->

## Quy trình

- [ ] Gắn nhãn `rfc`.
- [ ] Thảo luận tối thiểu 1 tuần hoặc tới khi đồng thuận.
- [ ] Core team (CODEOWNERS `docs/contributing/**`) duyệt → cập nhật Trạng thái thành
      `Accepted`/`Rejected` trong file RFC, rồi merge MR này (không phải merge code implement).
- [ ] Nếu `Accepted`: mở MR implement riêng, link ngược lại RFC này, dùng template Default.
