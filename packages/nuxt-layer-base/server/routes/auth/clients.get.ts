import type { AuthClientOption } from '@antadmin/composables'
import type { AuthConfig } from '../../utils/iam'
import { fetchClients } from '../../utils/iam'

// Proxy danh sách ứng dụng cho dropdown "Chọn ứng dụng". Đi qua BFF để tránh CORS
// (IAM khác origin) và giữ một điểm cấu hình endpoint duy nhất.
export default defineEventHandler(async (event): Promise<{ clients: AuthClientOption[] }> => {
  const { auth } = useRuntimeConfig(event) as unknown as { auth: AuthConfig }

  // DEV: dữ liệu mẫu để form chạy khi chưa cắm IAM thật.
  if (auth.mock) {
    return {
      clients: [
        { id: 'mock-oap-ocm', code: 'OAP_OCM', name: 'ONE AUTO - QUẢN LÝ TỔ CHỨC' },
        { id: 'mock-oap-cus', code: 'OAP_CUS', name: 'ONE AUTO - QUẢN LÝ KHÁCH HÀNG' },
      ],
    }
  }

  const clients = await fetchClients(auth)
  return { clients }
})
