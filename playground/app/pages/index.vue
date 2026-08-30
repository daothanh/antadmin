<script setup lang="ts">
// Trang công khai (không yêu cầu đăng nhập).
definePageMeta({ auth: false })

const { user, isAuthenticated, login, logout } = useAuth()
</script>

<template>
  <div>
    <h1>AntAdmin Framework Playground</h1>

    <template v-if="isAuthenticated">
      <p>Xin chào <strong>{{ user?.name }}</strong> ({{ user?.email }})</p>
      <p>Roles: {{ user?.roles.join(', ') }}</p>
      <p>Permissions: {{ user?.permissions.join(', ') }}</p>
      <a-space>
        <CButton
          type="primary"
          @click="navigateTo('/orders')"
        >
          Tới Đơn hàng
        </CButton>
        <CButton @click="logout('/')">
          Đăng xuất
        </CButton>
      </a-space>
    </template>

    <template v-else>
      <p>Bạn chưa đăng nhập.</p>
      <CButton
        type="primary"
        @click="login('/')"
      >
        Đăng nhập (mock)
      </CButton>
    </template>
  </div>
</template>
