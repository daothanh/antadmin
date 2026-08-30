<script setup lang="ts">
// Yêu cầu quyền admin.super — user mock KHÔNG có → permission.global chặn (403).
definePageMeta({ permissions: ['admin.super'] })
</script>

<template>
  <div>
    <h1>Khu vực Admin</h1>
    <p>Chỉ hiển thị nếu bạn có quyền <code>admin.super</code>.</p>
  </div>
</template>
