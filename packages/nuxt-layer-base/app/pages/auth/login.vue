<script setup lang="ts">
import { useAppConfig, useRoute, navigateTo } from 'nuxt/app'
import { useAuth } from '@antadmin/composables'

// Trang đăng nhập first-party (không dùng layout shell, không yêu cầu auth).
// Chỉ là vỏ mỏng bọc <AntAdminLoginForm> — dự án có thể tự tạo pages/auth/login.vue
// để đổi bố cục/nhãn mà vẫn tái dùng component.
definePageMeta({ auth: false, layout: false })

const route = useRoute()
const appConfig = useAppConfig()
const { isAuthenticated } = useAuth()

const appTitle = (appConfig.antadmin?.appTitle as string) ?? 'AntAdmin'

// Chỉ nhận redirect nội bộ (chống open redirect phía client).
function safeRedirect(): string {
  const target = route.query.redirect
  if (typeof target !== 'string' || target[0] !== '/') return '/'
  if (target[1] === '/' || target[1] === '\\') return '/'
  return target
}

// Đã đăng nhập mà vào trang login → đưa về đích.
if (isAuthenticated.value) {
  await navigateTo(safeRedirect(), { replace: true })
}

async function onSuccess() {
  await navigateTo(safeRedirect(), { replace: true })
}
</script>

<template>
  <AntAdminLoginForm
    :title="appTitle"
    subtitle="Đăng nhập"
    @success="onSuccess"
  />
</template>
