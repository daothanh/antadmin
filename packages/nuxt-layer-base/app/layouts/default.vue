<script setup lang="ts">
import type { NavItem } from '@antadmin/ui'

// Layout mặc định của framework: shell sider + header + content.
// Team sản phẩm KHÔNG cần viết lại — chỉ khai báo menu/tiêu đề trong app.config.ts:
//   export default defineAppConfig({ antadmin: { appTitle, footerText, nav: [...] } })
// Muốn đổi khung hoàn toàn: tạo app/layouts/default.vue trong dự án (Nuxt override).

const appConfig = useAppConfig()
const route = useRoute()
const { user, isAuthenticated, logout } = useAuth()
const { isDark, toggle: toggleTheme } = useThemeMode()

// Trạng thái thu gọn sider — giữ qua điều hướng bằng useState.
const collapsed = useState('antadmin:layout:collapsed', () => false)

// Lọc menu theo quyền: item khai `permission` mà user không có → ẩn.
const { filterByPermission } = usePermission()
const nav = computed<NavItem[]>(() =>
  filterByPermission((appConfig.antadmin?.nav as NavItem[]) ?? []),
)
const topNav = computed<NavItem[]>(() =>
  filterByPermission((appConfig.antadmin?.topNav as NavItem[]) ?? []),
)
const appTitle = computed(() => appConfig.antadmin?.appTitle ?? 'AntAdmin')
const footerText = computed(() => appConfig.antadmin?.footerText ?? '')

function onNavigate(path: string) {
  if (path !== route.path) navigateTo(path)
}
</script>

<template>
  <CAppLayout
    v-model:collapsed="collapsed"
    :app-title="appTitle"
    :footer-text="footerText"
  >
    <template #nav>
      <CSideNav
        :items="nav"
        :active-path="route.path"
        :collapsed="collapsed"
        @navigate="onNavigate"
      />
    </template>

    <template #header>
      <CTopNav
        v-if="topNav.length"
        :items="topNav"
        :active-path="route.path"
        @navigate="onNavigate"
      />
    </template>

    <template #actions>
      <button
        type="button"
        class="antadmin-iconbtn"
        :aria-label="isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle
            cx="12"
            cy="12"
            r="5"
          />
          <path
            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
      <button
        type="button"
        class="antadmin-iconbtn"
        aria-label="Thông báo"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span class="antadmin-iconbtn__dot" />
      </button>
      <template v-if="isAuthenticated">
        <a-dropdown
          placement="bottomRight"
          trigger="click"
        >
          <button
            type="button"
            class="antadmin-iconbtn"
            aria-label="Tài khoản"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle
                cx="12"
                cy="7"
                r="4"
              />
            </svg>
          </button>
          <template #overlay>
            <a-menu>
              <a-menu-item
                key="user"
                disabled
              >
                <div class="antadmin-account-info">
                  <strong>{{ user?.name ?? 'Tài khoản' }}</strong>
                  <small v-if="user?.email">{{ user.email }}</small>
                </div>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item
                key="logout"
                @click="logout('/')"
              >
                Đăng xuất
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </template>

    <NuxtErrorBoundary>
      <slot />
      <template #error="{ error }">
        <CEmpty
          :description="`Đã xảy ra lỗi: ${error?.message ?? 'không xác định'}`"
          bordered
        />
      </template>
    </NuxtErrorBoundary>
  </CAppLayout>
</template>

<style scoped>
.antadmin-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--antadmin-color-text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}
.antadmin-iconbtn:hover {
  background: var(--antadmin-color-surface-muted);
  color: var(--antadmin-color-primary);
}
.antadmin-iconbtn {
  position: relative;
}
.antadmin-iconbtn__dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--antadmin-color-error);
  border: 1.5px solid var(--antadmin-color-surface);
}
.antadmin-account-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.antadmin-account-info small {
  color: var(--antadmin-color-text-muted);
}
</style>
