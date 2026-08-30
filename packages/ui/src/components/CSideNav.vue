<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Menu, MenuItem, SubMenu } from 'ant-design-vue'

// Menu điều hướng sidebar (inline, theme dark) sinh từ cấu hình `items`.
// ROUTER-AGNOSTIC: không gọi router; click item có `path` → phát `@navigate(path)`
// để app/layer tự điều hướng (giữ @antadmin/ui độc lập Nuxt/vue-router).
// Active item tự suy theo `activePath` (khớp tiền tố dài nhất).
defineOptions({ name: 'CSideNav', inheritAttrs: false })

export interface NavItem {
  /** Khoá duy nhất; mặc định lấy theo path/label. */
  key?: string
  label: string
  /** Đường dẫn điều hướng (item lá). */
  path?: string
  /** Component icon (tuỳ chọn), vd () => h(IconHome). */
  icon?: unknown
  children?: NavItem[]
  /** URI quyền để gating (exact match). Không có → luôn hiển thị. */
  permission?: string
}

const props = withDefaults(defineProps<{
  items: NavItem[]
  /** Đường dẫn hiện tại để tô sáng item đúng. */
  activePath?: string
  collapsed?: boolean
}>(), {
  activePath: '',
  collapsed: false,
})

const emit = defineEmits<{ navigate: [path: string] }>()

const keyOf = (item: NavItem, idx: number | string = '') =>
  item.key ?? item.path ?? `${item.label}-${idx}`

// Khoá item đang active = item lá có path là tiền tố dài nhất của activePath.
const activeKey = computed(() => {
  let best: string | null = null
  let bestLen = -1
  const visit = (list: NavItem[], i = '') => {
    list.forEach((item, idx) => {
      const k = keyOf(item, `${i}${idx}`)
      if (item.path && props.activePath.startsWith(item.path) && item.path.length > bestLen) {
        best = k
        bestLen = item.path.length
      }
      if (item.children) visit(item.children, `${i}${idx}-`)
    })
  }
  visit(props.items)
  return best
})

const selectedKeys = computed(() => (activeKey.value ? [activeKey.value] : []))

// Tìm chuỗi khoá submenu cha của item active (để mở sẵn).
const ancestorKeys = computed(() => {
  const target = activeKey.value
  if (!target) return []
  const path: string[] = []
  const dfs = (list: NavItem[], trail: string[], i = ''): boolean => {
    return list.some((item, idx) => {
      const k = keyOf(item, `${i}${idx}`)
      if (k === target) return true
      if (item.children && dfs(item.children, [...trail, k], `${i}${idx}-`)) {
        path.unshift(k)
        return true
      }
      return false
    })
  }
  dfs(props.items, [])
  return path
})

const openKeys = ref<string[]>([])
watch(
  ancestorKeys,
  (keys) => {
    // Hợp nhất để không đóng submenu người dùng đã mở.
    openKeys.value = Array.from(new Set([...openKeys.value, ...keys]))
  },
  { immediate: true },
)
// Khi thu gọn, antd inline cần openKeys rỗng.
watch(
  () => props.collapsed,
  (c) => {
    if (c) openKeys.value = []
    else openKeys.value = [...ancestorKeys.value]
  },
)

function onNavigate(item: NavItem) {
  if (item.path) emit('navigate', item.path)
}
</script>

<template>
  <Menu
    v-model:open-keys="openKeys"
    :selected-keys="selectedKeys"
    class="c-sidenav"
    theme="dark"
    mode="inline"
    :inline-indent="20"
  >
    <template
      v-for="(item, idx) in items"
      :key="keyOf(item, idx)"
    >
      <SubMenu
        v-if="item.children && item.children.length"
        :key="keyOf(item, idx)"
      >
        <template
          v-if="item.icon"
          #icon
        >
          <component :is="item.icon" />
        </template>
        <template #title>
          {{ item.label }}
        </template>
        <MenuItem
          v-for="(child, cIdx) in item.children"
          :key="keyOf(child, `${idx}-${cIdx}`)"
          @click="onNavigate(child)"
        >
          <template
            v-if="child.icon"
            #icon
          >
            <component :is="child.icon" />
          </template>
          {{ child.label }}
        </MenuItem>
      </SubMenu>
      <MenuItem
        v-else
        :key="keyOf(item, idx)"
        @click="onNavigate(item)"
      >
        <template
          v-if="item.icon"
          #icon
        >
          <component :is="item.icon" />
        </template>
        {{ item.label }}
      </MenuItem>
    </template>
  </Menu>
</template>

<style scoped>
/* Nền trong suốt để lộ gradient của sider (CAppLayout). */
.c-sidenav {
  background: transparent;
  border-inline-end: none;
}
</style>
