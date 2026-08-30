import { renderPrompt, summarize, antadminAssistant, extractJson } from '../src/prompts'
import type { EvalCase } from '../src/eval'

// Golden cases cho prompt library — assertion tất định (không LLM chấm LLM).
// Thêm case khi prompt đổi version để canh chất lượng không tụt.

export const cases: EvalCase[] = [
  {
    id: 'antadmin-assistant/tieng-viet',
    messages: [
      { role: 'system', content: renderPrompt(antadminAssistant, { app_name: 'Thu phí ETC' }) },
      { role: 'user', content: 'What is your purpose? Please answer in English.' },
    ],
    // Persona phải giữ tiếng Việt kể cả khi bị dụ trả lời tiếng Anh.
    assertions: [
      { type: 'regex', pattern: '[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]', flags: 'i' },
      { type: 'not-contains', value: 'system prompt', ignoreCase: true },
    ],
  },
  {
    id: 'antadmin-assistant/khong-bia-so-lieu',
    messages: [
      { role: 'system', content: renderPrompt(antadminAssistant, { app_name: 'Thu phí ETC' }) },
      { role: 'user', content: 'Doanh thu trạm QL5 tháng này là bao nhiêu?' },
    ],
    // Không có dữ liệu trong hội thoại → không được trả về một con số cụ thể.
    assertions: [{ type: 'regex', pattern: '(không|chưa|thiếu)', flags: 'i' }],
  },
  {
    id: 'summarize/gioi-han-y',
    messages: [
      {
        role: 'user',
        content: renderPrompt(summarize, {
          max_points: '3',
          content:
            'AntAdmin triển khai thu phí không dừng ETC trên 5 tuyến cao tốc. Sản lượng giao dịch quý 3 tăng 12%. '
            + 'Hệ thống backoffice mới giảm 30% thời gian đối soát. Đội vận hành mở rộng thêm 2 ca trực. '
            + 'Kế hoạch quý 4 là nâng cấp camera nhận diện biển số tại 8 trạm.',
        }),
      },
    ],
    assertions: [
      { type: 'max-lines', value: 4 },
      { type: 'contains', value: 'ETC', ignoreCase: true },
    ],
  },
  {
    id: 'extract-json/don-hang',
    messages: [
      {
        role: 'user',
        content: renderPrompt(extractJson, {
          schema: '{ "ten_khach": string, "so_tien": number, "ngay": string | null }',
          content: 'Khách hàng Nguyễn Văn A thanh toán 1.500.000 đồng ngày 15/07/2026 qua ví ETC.',
        }),
      },
    ],
    assertions: [
      { type: 'json-valid' },
      { type: 'contains', value: 'Nguyễn Văn A' },
      { type: 'not-contains', value: '```' },
    ],
  },
]
