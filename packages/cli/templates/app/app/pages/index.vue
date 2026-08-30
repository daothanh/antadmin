<script setup lang="ts">
// Trang chủ công khai. useAuth/CButton có sẵn từ @antadmin/nuxt-layer-base.
definePageMeta({ auth: false })

const { user, isAuthenticated, login, logout } = useAuth()
</script>

<template>
  <div style="padding: 24px">
    <h1>__APP_NAME__</h1>
    <template v-if="isAuthenticated">
      <p>Xin chào {{ user?.name }}</p>
      <CButton @click="logout('/')">Đăng xuất</CButton>
    </template>
    <template v-else>
      <CButton type="primary" @click="login('/')">Đăng nhập</CButton>
    </template>
  </div>
</template>
