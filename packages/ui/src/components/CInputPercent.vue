<script setup lang="ts">
import { Input } from 'ant-design-vue'

// Ô nhập phần trăm: chỉ cho số + tối đa 2 chữ số thập phân, kẹp [min,max] khi blur.
// Dùng `v-model:value`. (Port từ OneAuto OaInputNumberPercent.)
defineOptions({ name: 'CInputPercent', inheritAttrs: true })

const props = withDefaults(defineProps<{
  value?: number | string | null
  min?: number
  max?: number
  precision?: number
}>(), {
  value: undefined,
  min: 0,
  max: 100,
  precision: 2,
})

const emit = defineEmits<{
  'update:value': [val: string]
  blur: [e: FocusEvent]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  let val = target.value.replace(/[^0-9.]/g, '')
  const parts = val.split('.')
  if (parts.length > 2) val = `${parts[0]}.${parts.slice(1).join('')}`
  if (parts.length === 2 && parts[1] && parts[1].length > props.precision) {
    val = `${parts[0]}.${parts[1].substring(0, props.precision)}`
  }
  target.value = val
  emit('update:value', val)
}

function onBlur(e: FocusEvent) {
  if (props.value === null || props.value === undefined || props.value === '') {
    emit('blur', e)
    return
  }
  let num = Number.parseFloat(String(props.value))
  if (Number.isNaN(num)) {
    emit('blur', e)
    return
  }
  if (num < props.min) num = props.min
  if (num > props.max) num = props.max
  const str = String(num)
  if (String(props.value) !== str) emit('update:value', str)
  emit('blur', e)
}
</script>

<template>
  <Input
    :value="value ?? ''"
    v-bind="$attrs"
    inputmode="decimal"
    suffix="%"
    @input="onInput"
    @blur="onBlur"
  />
</template>
