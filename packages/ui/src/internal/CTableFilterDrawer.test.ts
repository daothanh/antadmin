/* eslint-disable vue/one-component-per-file -- nhiều stub antd trong 1 file test */
import { h, isProxy, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { TableFilterField, TableFilterValues } from './filter'

// Stub primitive antdv thành DOM tối giản: Drawer chỉ render khi open (có nút ✕ + footer), FormItem render
// label kèm `for`, control giữ props để kiểm tra và phát update:value như antdv.
vi.mock('ant-design-vue', async () => {
  const { defineComponent, h } = await import('vue')

  const Drawer = defineComponent({
    name: 'ADrawer',
    props: {
      open: Boolean,
      title: { type: String, default: undefined },
      width: { type: [String, Number], default: undefined },
    },
    emits: ['close'],
    setup: (props, { slots, emit }) => () =>
      props.open
        ? h('aside', { class: 'drawer', 'data-width': props.width }, [
            h('h2', { class: 'drawer-title' }, props.title),
            h('button', { class: 'drawer-close', onClick: () => emit('close') }),
            slots.default?.(),
            h('footer', slots.footer?.()),
          ])
        : null,
  })

  const Form = defineComponent({
    name: 'AForm',
    setup: (_p, { slots, attrs }) => () => h('form', { ...attrs }, slots.default?.()),
  })

  const FormItem = defineComponent({
    name: 'AFormItem',
    props: {
      label: { type: String, default: undefined },
      htmlFor: { type: String, default: undefined },
    },
    setup: (props, { slots }) => () =>
      h('div', { class: 'form-item' }, [h('label', { for: props.htmlFor }, props.label), slots.default?.()]),
  })

  const Input = defineComponent({
    name: 'AInput',
    props: { value: { type: String, default: undefined } },
    emits: ['update:value', 'pressEnter'],
    setup: (props, { emit }) => () =>
      h('input', {
        value: props.value,
        onInput: (e: Event) => emit('update:value', (e.target as HTMLInputElement).value),
        onKeyup: (e: KeyboardEvent) => e.key === 'Enter' && emit('pressEnter', e),
      }),
  })

  // Control chọn giá trị: chỉ cần props để kiểm tra, test phát update:value qua vm.$emit.
  function pickerStub(name: string, extraProps: Record<string, unknown> = {}) {
    return defineComponent({
      name,
      props: {
        value: { type: [String, Number, Array], default: undefined },
        placeholder: { type: String, default: undefined },
        valueFormat: { type: String, default: undefined },
        format: { type: String, default: undefined },
        ...extraProps,
      },
      emits: ['update:value'],
      setup: () => () => h('div', { class: name }),
    })
  }

  const Button = defineComponent({
    name: 'AButton',
    setup: (_p, { slots, attrs }) => () => h('button', { ...attrs }, slots.default?.()),
  })

  return {
    Button,
    DatePicker: pickerStub('ADatePicker'),
    Drawer,
    Form,
    FormItem,
    Input,
    RangePicker: pickerStub('ARangePicker'),
    Select: pickerStub('ASelect', {
      options: { type: Array, default: undefined },
      mode: { type: String, default: undefined },
    }),
  }
})

import CTableFilterDrawer from './CTableFilterDrawer.vue'

const BRANDS = [
  { label: 'GEELY', value: 'GEELY' },
  { label: 'LYNK & CO', value: 'LYNK' },
]
const fields: TableFilterField[] = [
  { key: 'code', label: 'Mã xe', type: 'input', placeholder: 'Nhập mã xe' },
  { key: 'brand', label: 'Hãng xe', type: 'select', options: BRANDS, multiple: true },
  { key: 'status', label: 'Trạng thái', type: 'select', options: [{ label: 'Hoạt động', value: 1 }] },
  { key: 'soldAt', label: 'Ngày bán', type: 'date' },
  { key: 'updatedAt', label: 'Ngày cập nhật', type: 'dateRange' },
]

type Wrapper = ReturnType<typeof mount>

function mountDrawer(props: { values?: TableFilterValues; open?: boolean } = {}) {
  return mount(CTableFilterDrawer, { props: { fields, open: true, ...props } })
}
function inputOf(w: Wrapper) {
  return w.find('input')
}
function selectsOf(w: Wrapper) {
  return w.findAllComponents({ name: 'ASelect' })
}
function buttonByText(w: Wrapper, text: string) {
  return w.findAll('button').find((b) => b.text() === text)!
}

describe('CTableFilterDrawer', () => {
  it('đóng → không render; mở → dựng control theo type, nhãn nối id control, ngày dạng YYYY-MM-DD', () => {
    expect(mountDrawer({ open: false }).find('.drawer').exists()).toBe(false)

    const w = mountDrawer()
    expect(w.find('.drawer-title').text()).toBe('Bộ lọc')
    expect(w.find('.drawer').attributes('data-width')).toBe('min(420px, 100vw)')
    const labels = w.findAll('label')
    expect(labels.map((label) => label.text())).toEqual([
      'Mã xe',
      'Hãng xe',
      'Trạng thái',
      'Ngày bán',
      'Ngày cập nhật',
    ])
    for (const label of labels) {
      expect(w.find(`[id="${label.attributes('for')}"]`).exists()).toBe(true)
    }
    expect(inputOf(w).attributes('placeholder')).toBe('Nhập mã xe')
    expect(selectsOf(w)[0]!.props()).toMatchObject({ mode: 'multiple', options: BRANDS })
    expect(selectsOf(w)[1]!.props('mode')).toBeUndefined()
    for (const name of ['ADatePicker', 'ARangePicker']) {
      expect(w.findComponent({ name }).props()).toMatchObject({
        valueFormat: 'YYYY-MM-DD',
        format: 'DD/MM/YYYY',
      })
    }
  })

  it('nháp chép từ values, sửa không đổi values; Áp dụng → emit apply giá trị đã làm sạch rồi đóng', async () => {
    const values = { code: 'E22H', brand: ['GEELY'] }
    const w = mountDrawer({ values })
    expect((inputOf(w).element as HTMLInputElement).value).toBe('E22H')
    expect(selectsOf(w)[0]!.props('value')).toEqual(['GEELY'])

    await inputOf(w).setValue('  P145 ')
    selectsOf(w)[1]!.vm.$emit('update:value', 1)
    w.findComponent({ name: 'ARangePicker' }).vm.$emit('update:value', ['2026-09-01', '2026-09-13'])
    await nextTick()
    expect(w.findComponent({ name: 'ARangePicker' }).props('value')).toEqual(['2026-09-01', '2026-09-13'])
    expect(values).toEqual({ code: 'E22H', brand: ['GEELY'] })

    await buttonByText(w, 'Áp dụng').trigger('click')
    const [applied] = w.emitted<[TableFilterValues]>('apply')!.at(-1)!
    expect(applied).toEqual({
      code: 'P145',
      brand: ['GEELY'],
      status: 1,
      updatedAt: ['2026-09-01', '2026-09-13'],
    })
    expect(isProxy(applied)).toBe(false)
    expect(isProxy(applied.brand)).toBe(false)
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('Enter trong ô nhập → Áp dụng', async () => {
    const w = mountDrawer()
    await inputOf(w).setValue('E22H')
    await inputOf(w).trigger('keyup', { key: 'Enter' })
    expect(w.emitted('apply')?.at(-1)).toEqual([{ code: 'E22H' }])
  })

  it('Đặt lại → xoá nháp, không áp dụng và drawer vẫn mở', async () => {
    const w = mountDrawer({ values: { code: 'E22H', status: 1 } })
    await buttonByText(w, 'Đặt lại').trigger('click')
    expect((inputOf(w).element as HTMLInputElement).value).toBe('')
    expect(selectsOf(w)[1]!.props('value')).toBeUndefined()
    expect(w.emitted('apply')).toBeUndefined()
    expect(w.emitted('update:open')).toBeUndefined()
  })

  it('đóng bằng ✕ → emit update:open false, không áp dụng; mở lại → nháp lấy lại values', async () => {
    const w = mountDrawer({ values: { code: 'E22H' } })
    await inputOf(w).setValue('đang sửa dở')
    await w.find('.drawer-close').trigger('click')
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
    expect(w.emitted('apply')).toBeUndefined()

    await w.setProps({ open: false })
    await w.setProps({ open: true })
    expect((inputOf(w).element as HTMLInputElement).value).toBe('E22H')
  })

  it('giá trị sai kiểu → control nhận undefined; select nhiều chỉ giữ phần tử hợp lệ', () => {
    const w = mountDrawer({
      values: { code: 5, brand: 'GEELY', status: { id: 1 }, soldAt: 20_260_913, updatedAt: ['2026-09-01', null] },
    })
    expect((inputOf(w).element as HTMLInputElement).value).toBe('')
    expect(selectsOf(w)[0]!.props('value')).toBeUndefined()
    expect(selectsOf(w)[1]!.props('value')).toBeUndefined()
    expect(w.findComponent({ name: 'ADatePicker' }).props('value')).toBeUndefined()
    expect(w.findComponent({ name: 'ARangePicker' }).props('value')).toBeUndefined()

    const mixed = mountDrawer({ values: { brand: ['GEELY', null, 3, true], updatedAt: '2026-09-01' } })
    expect(selectsOf(mixed)[0]!.props('value')).toEqual(['GEELY', 3])
    expect(mixed.findComponent({ name: 'ARangePicker' }).props('value')).toBeUndefined()
  })

  it('trường custom → slot #field nhận field + nháp, giá trị ghi vào nháp được áp dụng', async () => {
    const w = mount(CTableFilterDrawer, {
      props: { open: true, fields: [{ key: 'dealer', label: 'Đại lý', type: 'custom' }] },
      slots: {
        field: ({ field, values }: { field: TableFilterField; values: TableFilterValues }) =>
          h('button', { class: 'pick', onClick: () => (values[field.key] = 'D01') }, field.label),
      },
    })
    expect(w.find('label').text()).toBe('Đại lý')
    await w.find('.pick').trigger('click')
    await buttonByText(w, 'Áp dụng').trigger('click')
    expect(w.emitted('apply')?.at(-1)).toEqual([{ dealer: 'D01' }])
  })
})
