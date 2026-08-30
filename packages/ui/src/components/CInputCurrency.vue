<script setup lang="ts">
import { ref, watch } from 'vue'
import { Input } from 'ant-design-vue'

// Ô nhập tiền tệ: hiển thị dạng 1.234.567,89 (dấu chấm ngăn nghìn, phẩy thập phân),
// model trả về số thuần. Dùng `v-model:value`. (Port từ OneAuto OaInputNumberCurrency.)
defineOptions({ name: 'CInputCurrency', inheritAttrs: true })

const props = defineProps<{
  value?: string | number | null
}>()

const emit = defineEmits<{
  'update:value': [val: number | null]
  blur: [e: FocusEvent]
}>()

const display = ref('')

function parse(val: string): number | null {
  if (!val) return null
  const raw = val.replace(/\./g, '').replace(',', '.')
  const num = Number.parseFloat(raw)
  return Number.isNaN(num) ? null : num
}

function format(val: string | number | null): string {
  if (val === null || val === undefined || val === '') return ''
  const parts = String(val).split('.')
  const integer = (parts[0] ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decimal = parts.length > 1 ? `,${parts[1]}` : ''
  return integer + decimal
}

watch(
  () => props.value,
  (val) => {
    const cur = parse(display.value)
    const next = typeof val === 'string' ? Number.parseFloat(val) : (val ?? null)
    if (cur !== next) display.value = format(val ?? null)
  },
  { immediate: true },
)

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  let val = target.value.replace(/[^0-9,]/g, '')

  const parts = val.split(',')
  if (parts.length > 2) val = `${parts[0]},${parts.slice(1).join('')}`

  const [rawInt = '', dec] = val.split(',')
  let integer = rawInt
  if (integer.length > 1 && integer.startsWith('0')) integer = integer.replace(/^0+/, '')
  const formattedInt = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const formatted = val.includes(',') ? `${formattedInt},${dec ?? ''}` : formattedInt
  if (target.value !== formatted) target.value = formatted
  display.value = formatted
  emit('update:value', parse(formatted))
}

function onBlur(e: FocusEvent) {
  display.value = format(parse(display.value))
  emit('blur', e)
}
</script>

<template>
  <Input
    :value="display"
    v-bind="$attrs"
    inputmode="decimal"
    @input="onInput"
    @blur="onBlur"
  />
</template>
