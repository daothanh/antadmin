<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from 'ant-design-vue'

// Tiêu đề trang: breadcrumb + title/subTitle + slot #extra (actions bên phải).
// Router-agnostic: click breadcrumb có `to` sẽ phát sự kiện `navigate` để app tự
// điều hướng (vd router.push) — giữ @antadmin/ui không phụ thuộc Nuxt/vue-router.
defineOptions({ name: 'CPageHeader' })

export interface BreadcrumbRoute {
  title: string
  to?: string
}

withDefaults(defineProps<{
  title?: string
  subTitle?: string
  breadcrumb?: BreadcrumbRoute[]
}>(), {
  title: undefined,
  subTitle: undefined,
  breadcrumb: () => [],
})

const emit = defineEmits<{ navigate: [to: string] }>()

function onCrumb(e: Event, to?: string) {
  if (!to) return
  e.preventDefault()
  emit('navigate', to)
}
</script>

<template>
  <div class="c-page-header">
    <div class="c-page-header__main">
      <Breadcrumb
        v-if="breadcrumb.length"
        class="c-page-header__crumbs"
      >
        <BreadcrumbItem
          v-for="(item, i) in breadcrumb"
          :key="i"
        >
          <a
            v-if="item.to"
            :href="item.to"
            @click="onCrumb($event, item.to)"
          >{{ item.title }}</a>
          <span v-else>{{ item.title }}</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div class="c-page-header__titles">
        <slot name="title">
          <h1
            v-if="title"
            class="c-page-header__title"
          >
            {{ title }}
          </h1>
        </slot>
        <span
          v-if="subTitle"
          class="c-page-header__subtitle"
        >{{ subTitle }}</span>
      </div>
    </div>

    <div
      v-if="$slots.extra"
      class="c-page-header__extra"
    >
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.c-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--antadmin-color-surface);
  border-bottom: 1px solid var(--antadmin-color-border);
}
.c-page-header__crumbs {
  margin-bottom: 4px;
  font-size: 12px;
}
.c-page-header__titles {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.c-page-header__title {
  margin: 0;
  font-family: var(--antadmin-font-family-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--antadmin-color-text);
}
.c-page-header__subtitle {
  font-size: 13px;
  color: var(--antadmin-color-text-muted);
}
.c-page-header__extra {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
