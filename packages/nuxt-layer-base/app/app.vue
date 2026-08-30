<script setup lang="ts">
import { theme } from 'ant-design-vue'
import { getAntdTheme, cssVarsText } from '@antadmin/theme'

// ConfigProvider áp theme AntAdmin cho toàn app (1 chỗ duy nhất).
// Lưu ý: nếu team override app.vue, cần tự thêm lại <a-config-provider>.
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
  <a-config-provider :theme="antdTheme">
    <NuxtLoadingIndicator color="#FF9800" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>
