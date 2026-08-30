<script setup lang="ts">
import { computed } from 'vue'
import { Menu, MenuItem, SubMenu } from 'ant-design-vue'
import type { NavItem } from './CSideNav.vue'

// Menu module ngang trên header (mẫu OneAuto: ĐIỀU HÀNH, TỔ CHỨC, SẢN PHẨM...).
// ROUTER-AGNOSTIC: click item có `path` → phát `@navigate(path)`.
defineOptions({ name: 'CTopNav', inheritAttrs: false })

const props = withDefaults(defineProps<{
  items: NavItem[]
  activePath?: string
}>(), {
  activePath: '',
})

const emit = defineEmits<{ navigate: [path: string] }>()

const keyOf = (item: NavItem, idx: number | string = '') =>
  item.key ?? item.path ?? `${item.label}-${idx}`

// Item active = path là tiền tố dài nhất của activePath (ưu tiên path dài hơn
// để '/orders' không bị '/' chiếm khi cả hai đều khớp).
const activeKey = computed(() => {
  let best: string | null = null
  let bestLen = -1
  props.items.forEach((item, idx) => {
    if (item.path && props.activePath.startsWith(item.path) && item.path.length > bestLen) {
      best = keyOf(item, idx)
      bestLen = item.path.length
    }
  })
  return best
})
const selectedKeys = computed(() => (activeKey.value ? [activeKey.value] : []))

function onNavigate(item: NavItem) {
  if (item.path) emit('navigate', item.path)
}
</script>

<template>
  <Menu
    :selected-keys="selectedKeys"
    class="c-topnav"
    mode="horizontal"
    :inline-indent="0"
  >
    <template
      v-for="(item, idx) in items"
      :key="keyOf(item, idx)"
    >
      <SubMenu
        v-if="item.children && item.children.length"
        :key="keyOf(item, idx)"
        :title="item.label"
      >
        <MenuItem
          v-for="(child, cIdx) in item.children"
          :key="keyOf(child, `${idx}-${cIdx}`)"
          @click="onNavigate(child)"
        >
          {{ child.label }}
        </MenuItem>
      </SubMenu>
      <MenuItem
        v-else
        :key="keyOf(item, idx)"
        @click="onNavigate(item)"
      >
        {{ item.label }}
      </MenuItem>
    </template>
  </Menu>
</template>

<style scoped>
.c-topnav {
  flex: 1;
  min-width: 0;
  border-bottom: none;
  background: transparent;
  font-weight: 600;
}
</style>
