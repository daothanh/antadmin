<script setup lang="ts">
import type { NuxtError } from '#app'

// Trang lỗi fatal của Nuxt (SSR 500, route không khớp…). App sản phẩm có thể ghi
// đè bằng app/error.vue riêng. Dùng a-result (antd) + CButton (global từ AntAdminUI).
const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)
const isNotFound = computed(() => statusCode.value === 404)
const subTitle = computed(
  () => props.error?.message || (isNotFound.value ? 'Không tìm thấy trang.' : 'Đã xảy ra lỗi không mong muốn.'),
)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="antadmin-error-page">
    <a-result
      :status="isNotFound ? '404' : 'error'"
      :title="String(statusCode)"
      :sub-title="subTitle"
    >
      <template #extra>
        <CButton
          variant="primary"
          @click="goHome"
        >
          Về trang chủ
        </CButton>
      </template>
    </a-result>
  </div>
</template>

<style scoped>
.antadmin-error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--antadmin-color-page);
}
</style>
