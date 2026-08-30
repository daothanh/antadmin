<script setup lang="ts">
import { computed } from 'vue'
import { Layout, LayoutSider, LayoutHeader, LayoutContent, LayoutFooter } from 'ant-design-vue'

// Khung layout chung của ứng dụng AntAdmin (bố cục theo OneAuto): dải logo + nút thu
// gọn ở góc trên-trái (navy), header trắng (menu module + account) bên phải;
// dưới là sider (gradient navy) + vùng nội dung cuộn; footer ở cuối cột nội dung.
//
// Slots:
//  - #logo    : khu thương hiệu (mặc định: chữ cái + appTitle)
//  - #nav     : điều hướng sider (thường là <CSideNav>)
//  - #header  : nội dung header (thường là <CTopNav> menu module)
//  - #actions : cụm bên phải header (chuông, account...)
//  - default  : nội dung trang
//  - #footer  : ghi đè footer (mặc định: footerText)
defineOptions({ name: 'CAppLayout', inheritAttrs: false })

const props = withDefaults(defineProps<{
  collapsed?: boolean
  appTitle?: string
  footerText?: string
  collapsible?: boolean
  siderWidth?: number
}>(), {
  collapsed: false,
  appTitle: 'AntAdmin',
  footerText: '',
  collapsible: true,
  siderWidth: 248,
})

const emit = defineEmits<{ 'update:collapsed': [v: boolean] }>()

const collapsedWidth = 64
const brandWidth = computed(() => (props.collapsed ? collapsedWidth : props.siderWidth))

function toggle() {
  emit('update:collapsed', !props.collapsed)
}
</script>

<template>
  <Layout class="c-app">
    <!-- Header full-width: dải logo navy (góc trái) + header trắng -->
    <LayoutHeader class="c-app__topbar">
      <div
        class="c-app__brand"
        :class="{ 'c-app__brand--collapsed': collapsed }"
        :style="{ width: `${brandWidth}px` }"
      >
        <!-- Thu gọn: ẩn logo, chỉ còn nút trigger (đổi icon). -->
        <slot
          v-if="!collapsed"
          name="logo"
        >
          <span class="c-app__brand-title">{{ appTitle }}</span>
        </slot>
        <button
          v-if="collapsible"
          type="button"
          class="c-app__toggle"
          :aria-label="collapsed ? 'Mở menu' : 'Thu gọn menu'"
          @click="toggle"
        >
          <!-- Icon kiểu tabler: collapse khi đang mở, expand khi đã thu gọn. -->
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
            <path d="M9 4v16" />
            <path
              v-if="!collapsed"
              d="M15 10l-2 2l2 2"
            />
            <path
              v-else
              d="M13 10l2 2l-2 2"
            />
          </svg>
        </button>
      </div>

      <div class="c-app__header">
        <div class="c-app__header-main">
          <slot name="header" />
        </div>
        <div class="c-app__header-actions">
          <slot name="actions" />
        </div>
      </div>
    </LayoutHeader>

    <!-- Thân: sider + nội dung -->
    <Layout
      class="c-app__body"
      has-sider
    >
      <LayoutSider
        :collapsed="collapsed"
        :collapsible="false"
        :trigger="null"
        :width="siderWidth"
        :collapsed-width="collapsedWidth"
        class="c-app__sider"
      >
        <div class="c-app__nav">
          <slot name="nav" />
        </div>
      </LayoutSider>

      <Layout class="c-app__main">
        <LayoutContent class="c-app__content">
          <slot />
        </LayoutContent>
        <LayoutFooter
          v-if="footerText || $slots.footer"
          class="c-app__footer"
        >
          <slot name="footer">
            {{ footerText }}
          </slot>
        </LayoutFooter>
      </Layout>
    </Layout>
  </Layout>
</template>

<style scoped>
.c-app {
  height: 100vh;
  overflow: hidden;
}

/* Thanh trên cùng */
.c-app__topbar {
  display: flex;
  align-items: stretch;
  height: 56px;
  padding: 0;
  background: var(--antadmin-color-surface);
  line-height: normal;
}
.c-app__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  padding: 0 12px 0 18px;
  overflow: hidden;
  white-space: nowrap;
  background: var(--antadmin-color-sidebar-top);
  transition: width 0.2s;
}
.c-app__brand--collapsed {
  justify-content: center;
  padding: 0;
}
.c-app__brand-title {
  flex: 1;
  color: #fff;
  font-family: var(--antadmin-font-family-heading);
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
}
.c-app__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: var(--antadmin-radius, 6px);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 0.15s;
}
.c-app__toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.c-app__header {
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--antadmin-color-border);
}
/* Khu menu chiếm trọn chiều cao header để gạch chân (ink-bar) của tab nằm sát
 * đáy header — kiểu tab indicator giống OneAuto. */
.c-app__header-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: stretch;
}
.c-app__header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

/* Thân */
.c-app__body {
  flex: 1;
  min-height: 0;
}
.c-app__sider {
  background: linear-gradient(
    to bottom,
    var(--antadmin-color-sidebar-top),
    var(--antadmin-color-sidebar-bottom)
  ) !important;
}
.c-app__nav {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.c-app__nav::-webkit-scrollbar {
  width: 4px;
}
.c-app__nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.c-app__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--antadmin-color-page);
}
.c-app__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
}
.c-app__footer {
  flex: none;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  color: var(--antadmin-color-text-muted);
  background: var(--antadmin-color-surface);
  border-top: 1px solid var(--antadmin-color-border);
}
</style>
