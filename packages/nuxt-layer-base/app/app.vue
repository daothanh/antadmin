<script setup lang="ts">
import { theme } from 'ant-design-vue'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import { getAntdTheme, cssVarsText } from '@antadmin/theme'

// ConfigProvider áp theme AntAdmin + locale vi_VN của antdv cho toàn app (1 chỗ duy nhất).
// Lưu ý: nếu team override app.vue, cần tự thêm lại <a-config-provider> (theme + locale).
// `mode` phản ứng theo useThemeMode (cookie) → đổi sáng/tối tại runtime.
const { mode } = useThemeMode()

const antdTheme = computed(() => ({
  ...getAntdTheme(mode.value),
  algorithm: mode.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
}))

// CSS variables --antadmin-* + color-scheme đổi theo mode (reactive).
useHead({
  htmlAttrs: { 'data-theme': computed(() => mode.value) },
  style: [{ id: 'antadmin-vars', innerHTML: computed(() => cssVarsText(mode.value)) }],
})
</script>

<template>
  <a-config-provider
    :theme="antdTheme"
    :locale="viVN"
  >
    <NuxtLoadingIndicator color="#FF9800" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>
