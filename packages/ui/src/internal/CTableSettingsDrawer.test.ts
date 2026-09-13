import { nextTick } from 'vue'
import type { SetupContext, VNodeChild } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { TableSettings } from '@antadmin/utils'
import type { SettingColumn } from './column-settings'

type StubRender = (
  props: Record<string, unknown>,
  context: Pick<SetupContext, 'attrs' | 'emit' | 'slots'>,
) => VNodeChild

// Stub primitive antdv thành DOM tối giản: Drawer chỉ render khi open (nút ✕ + footer), Segmented là các nút,
// Switch là button role="switch" nhận attrs (aria-label, id…), Select/RadioGroup giữ props để kiểm tra — test phát
// update:value qua vm.$emit như antdv.
vi.mock('ant-design-vue', async () => {
  const { defineComponent, h } = await import('vue')

  const emits: string[] = ['close', 'update:value', 'update:checked']

  // Mọi stub dùng chung một khung defineComponent (emits + setup) nên mỗi stub chỉ khai báo tên, props và hàm render.
  function defineStub(name: string, props: string[], render: StubRender) {
    return defineComponent({
      name,
      props,
      emits,
      setup: (stubProps, context) => () => render(stubProps, context),
    })
  }

  interface Option {
    label: string
    value: string
  }

  return {
    Button: defineStub('AButton', [], (_props, { attrs, slots }) => h('button', attrs, slots.default?.())),
    Drawer: defineStub('ADrawer', ['open', 'title', 'width'], (props, { emit, slots }) =>
      props.open
        ? h('aside', { class: 'drawer', 'data-width': props.width }, [
            h('h2', { class: 'drawer-title' }, String(props.title)),
            h('button', { class: 'drawer-close', onClick: () => emit('close') }),
            slots.default?.(),
            h('footer', slots.footer?.()),
          ])
        : null,
    ),
    Form: defineStub('AForm', [], (_props, { attrs, slots }) => h('form', attrs, slots.default?.())),
    FormItem: defineStub('AFormItem', ['label', 'htmlFor'], (props, { slots }) =>
      h('div', { class: 'form-item' }, [h('label', { for: props.htmlFor }, String(props.label)), slots.default?.()]),
    ),
    RadioGroup: defineStub('ARadioGroup', ['value', 'options', 'disabled'], (_props, { attrs }) =>
      h('div', { ...attrs, class: 'radio-group' }),
    ),
    Segmented: defineStub('ASegmented', ['value', 'options'], (props, { emit }) =>
      h(
        'div',
        { class: 'segmented' },
        (props.options as Option[]).map((option) =>
          h(
            'button',
            {
              class: 'segment',
              'aria-pressed': String(option.value === props.value),
              onClick: () => emit('update:value', option.value),
            },
            option.label,
          ),
        ),
      ),
    ),
    Select: defineStub('ASelect', ['value', 'options', 'disabled'], () => h('div', { class: 'select' })),
    Switch: defineStub('ASwitch', ['checked', 'disabled', 'checkedChildren', 'unCheckedChildren'], (props, { attrs, emit }) =>
      h(
        'button',
        {
          ...attrs,
          role: 'switch',
          'aria-checked': String(props.checked),
          disabled: props.disabled === true,
          onClick: () => emit('update:checked', !props.checked),
        },
        String(props.checked ? props.checkedChildren : props.unCheckedChildren),
      ),
    ),
  }
})

import CTableSettingsDrawer from './CTableSettingsDrawer.vue'

// STT cố định trái; Mã gói + Tên gói sắp xếp được; Giá bán thì không.
const COLUMNS: SettingColumn[] = [
  { key: 'index', label: 'STT', pin: 'left', sortField: null },
  { key: 'code', label: 'Mã gói', pin: 'none', sortField: 'code' },
  { key: 'name', label: 'Tên gói', pin: 'none', sortField: 'name' },
  { key: 'price', label: 'Giá bán', pin: 'none', sortField: null },
]
const DEFAULT_SETTINGS: TableSettings = { columnOrder: [], hiddenColumns: [], defaultSort: null }

type Wrapper = ReturnType<typeof mount>

interface DrawerProps {
  open?: boolean
  columns?: SettingColumn[]
  settings?: TableSettings
}

function mountDrawer(props: DrawerProps = {}, options: { attachTo?: HTMLElement } = {}) {
  return mount(CTableSettingsDrawer, {
    props: { open: true, columns: COLUMNS, settings: DEFAULT_SETTINGS, ...props },
    ...options,
  })
}
function labelsOf(w: Wrapper) {
  return w.findAll('.c-table-settings-drawer__label').map((label) => label.text())
}
function rowsOf(w: Wrapper) {
  return w.findAll('.c-table-settings-drawer__column')
}
function switchOf(w: Wrapper, label: string) {
  return w.find(`[aria-label="Hiện cột ${label}"]`)
}
function moveButton(w: Wrapper, label: string, direction: 'lên' | 'xuống') {
  return w.find(`[aria-label="Chuyển ${label} ${direction}"]`)
}
function sortSwitchOf(w: Wrapper) {
  return w.find('[role="switch"][aria-describedby]')
}
function buttonByText(w: Wrapper, text: string) {
  return w.findAll('button').find((button) => button.text() === text)!
}
// v-show chỉ đổi style (isVisible của test-utils cần gắn vào document mới đọc được).
function isShown(w: Wrapper, selector: string) {
  return !(w.find(selector).attributes('style') ?? '').includes('display: none')
}
function announcementOf(w: Wrapper) {
  return w.find('[aria-live="polite"]').text()
}

function createDataTransfer() {
  return { effectAllowed: 'none', dropEffect: 'none', setData: vi.fn(), setDragImage: vi.fn() }
}
// happy-dom chưa có DragEvent đầy đủ → Event thường gắn dataTransfer giả.
function dragEvent(type: string, dataTransfer: ReturnType<typeof createDataTransfer> | null = createDataTransfer()) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
  return event
}

describe('CTableSettingsDrawer — hiển thị cột', () => {
  it('đóng → không render; mở → dòng theo thứ tự thiết lập, cột ẩn tắt switch, có tab Khác', () => {
    expect(mountDrawer({ open: false }).find('.drawer').exists()).toBe(false)

    const w = mountDrawer({
      settings: { columnOrder: ['index', 'name', 'code', 'price'], hiddenColumns: ['price'], defaultSort: null },
    })
    expect(w.find('.drawer-title').text()).toBe('Thiết lập')
    expect(w.find('.drawer').attributes('data-width')).toBe('min(420px, 100vw)')
    expect(labelsOf(w)).toEqual(['STT', 'Tên gói', 'Mã gói', 'Giá bán'])
    expect(switchOf(w, 'Giá bán').attributes('aria-checked')).toBe('false')
    expect(switchOf(w, 'Giá bán').text()).toBe('Ẩn')
    expect(switchOf(w, 'STT').text()).toBe('Hiện')
    expect(w.findAll('.segment').map((segment) => segment.text())).toEqual(['Hiển thị cột', 'Khác'])
    expect(w.find('.c-table-settings-drawer__handle').attributes('draggable')).toBe('true')
  })

  it('nút ↑↓ đổi thứ tự trên nháp, tắt ở mép nhóm cố định; focus bám dòng vừa chuyển và báo vị trí', async () => {
    const w = mountDrawer({}, { attachTo: document.body })
    // STT một mình nhóm cố định trái; Mã gói đầu nhóm thường; Giá bán cuối danh sách.
    for (const [label, direction] of [
      ['STT', 'lên'],
      ['STT', 'xuống'],
      ['Mã gói', 'lên'],
      ['Giá bán', 'xuống'],
    ] as const) {
      expect(moveButton(w, label, direction).attributes('disabled')).toBeDefined()
    }

    await moveButton(w, 'Mã gói', 'xuống').trigger('click')
    await flushPromises()
    expect(labelsOf(w)).toEqual(['STT', 'Tên gói', 'Mã gói', 'Giá bán'])
    expect(document.activeElement).toBe(moveButton(w, 'Mã gói', 'xuống').element)
    expect(announcementOf(w)).toBe('Đã chuyển Mã gói tới vị trí 3/4')

    // Tới cuối danh sách → nút xuống tắt, focus sang nút lên của dòng.
    await moveButton(w, 'Mã gói', 'xuống').trigger('click')
    await flushPromises()
    expect(labelsOf(w)).toEqual(['STT', 'Tên gói', 'Giá bán', 'Mã gói'])
    expect(moveButton(w, 'Mã gói', 'xuống').attributes('disabled')).toBeDefined()
    expect(document.activeElement).toBe(moveButton(w, 'Mã gói', 'lên').element)

    // Lên tới đầu nhóm thường → focus sang nút xuống.
    await moveButton(w, 'Giá bán', 'lên').trigger('click')
    await flushPromises()
    expect(labelsOf(w)).toEqual(['STT', 'Giá bán', 'Tên gói', 'Mã gói'])
    expect(document.activeElement).toBe(moveButton(w, 'Giá bán', 'xuống').element)
    w.unmount()
  })

  it('ẩn/hiện cột trên nháp; không cho tắt cột cuối cùng đang hiện', async () => {
    const w = mountDrawer({ columns: COLUMNS.slice(1, 3) })
    await switchOf(w, 'Mã gói').trigger('click')
    expect(switchOf(w, 'Mã gói').attributes('aria-checked')).toBe('false')
    expect(switchOf(w, 'Tên gói').attributes('disabled')).toBeDefined()
    expect(switchOf(w, 'Mã gói').attributes('disabled')).toBeUndefined()

    await switchOf(w, 'Mã gói').trigger('click')
    expect(switchOf(w, 'Tên gói').attributes('disabled')).toBeUndefined()
  })

  it('kéo tay nắm qua dòng khác → đổi chỗ trong nhóm; ảnh kéo là cả dòng; thả xong báo vị trí', async () => {
    const w = mountDrawer()
    const handles = () => w.findAll('.c-table-settings-drawer__handle')
    const transfer = createDataTransfer()

    handles()[3]!.element.dispatchEvent(dragEvent('dragstart', transfer))
    await nextTick()
    expect(transfer.setData).toHaveBeenCalledWith('text/plain', 'price')
    expect(transfer.effectAllowed).toBe('move')
    expect(transfer.setDragImage).toHaveBeenCalledWith(rowsOf(w)[3]!.element, 16, expect.any(Number))
    expect(rowsOf(w)[3]!.classes()).toContain('c-table-settings-drawer__column--dragging')

    rowsOf(w)[1]!.element.dispatchEvent(dragEvent('dragenter'))
    await nextTick()
    expect(labelsOf(w)).toEqual(['STT', 'Giá bán', 'Mã gói', 'Tên gói'])

    // Đi qua STT (nhóm cố định trái) hoặc qua chính nó → giữ nguyên.
    rowsOf(w)[0]!.element.dispatchEvent(dragEvent('dragenter'))
    rowsOf(w)[1]!.element.dispatchEvent(dragEvent('dragenter'))
    await nextTick()
    expect(labelsOf(w)).toEqual(['STT', 'Giá bán', 'Mã gói', 'Tên gói'])

    const over = dragEvent('dragover')
    rowsOf(w)[2]!.element.dispatchEvent(over)
    expect(over.defaultPrevented).toBe(true)
    // Không có dataTransfer (một số môi trường) vẫn nhận thả.
    const bareOver = dragEvent('dragover', null)
    rowsOf(w)[2]!.element.dispatchEvent(bareOver)
    expect(bareOver.defaultPrevented).toBe(true)
    const drop = dragEvent('drop')
    rowsOf(w)[2]!.element.dispatchEvent(drop)
    expect(drop.defaultPrevented).toBe(true)

    handles()[1]!.element.dispatchEvent(dragEvent('dragend'))
    await nextTick()
    expect(w.find('.c-table-settings-drawer__column--dragging').exists()).toBe(false)
    expect(announcementOf(w)).toBe('Đã chuyển Giá bán tới vị trí 2/4')
  })

  it('không kéo dòng nào (vd kéo file từ ngoài vào) → dragover/dragenter/dragend bỏ qua', async () => {
    const w = mountDrawer()
    const over = dragEvent('dragover')
    rowsOf(w)[1]!.element.dispatchEvent(over)
    rowsOf(w)[1]!.element.dispatchEvent(dragEvent('dragenter'))
    w.find('.c-table-settings-drawer__handle').element.dispatchEvent(dragEvent('dragend'))
    await nextTick()
    expect(over.defaultPrevented).toBe(false)
    expect(labelsOf(w)).toEqual(['STT', 'Mã gói', 'Tên gói', 'Giá bán'])
    expect(announcementOf(w)).toBe('')

    // dragstart không kèm dataTransfer → vẫn đánh dấu dòng đang kéo.
    w.findAll('.c-table-settings-drawer__handle')[2]!.element.dispatchEvent(dragEvent('dragstart', null))
    await nextTick()
    expect(rowsOf(w)[2]!.classes()).toContain('c-table-settings-drawer__column--dragging')
  })
})

describe('CTableSettingsDrawer — sắp xếp mặc định', () => {
  it('tắt → control bị khoá; bật lần đầu chọn sẵn cột sắp xếp đầu tiên + Tăng dần; Lưu lại phát nháp rồi đóng', async () => {
    const w = mountDrawer()
    await w.findAll('.segment')[1]!.trigger('click')
    expect(isShown(w, '.c-table-settings-drawer__columns')).toBe(false)
    expect(isShown(w, 'form')).toBe(true)

    const select = w.findComponent({ name: 'ASelect' })
    const radio = w.findComponent({ name: 'ARadioGroup' })
    const sortSwitch = sortSwitchOf(w)
    expect(w.find(`label[for="${sortSwitch.attributes('id')}"]`).text()).toBe('Sắp xếp mặc định')
    expect(w.find(`label[for="${select.attributes('id')}"]`).text()).toBe('Cột sắp xếp')
    expect(select.props()).toMatchObject({
      disabled: true,
      value: undefined,
      options: [
        { label: 'Mã gói', value: 'code' },
        { label: 'Tên gói', value: 'name' },
      ],
    })
    expect(radio.props()).toMatchObject({ disabled: true, value: 'ascend' })
    expect(radio.attributes('aria-label')).toBe('Chiều sắp xếp')

    await sortSwitch.trigger('click')
    expect(select.props()).toMatchObject({ disabled: false, value: 'code' })
    expect(radio.props('disabled')).toBe(false)

    select.vm.$emit('update:value', 'name')
    radio.vm.$emit('update:value', 'descend')
    // Giá trị không hợp lệ từ control bị bỏ qua.
    select.vm.$emit('update:value', ['code'])
    radio.vm.$emit('update:value', 'up')
    await nextTick()
    expect(select.props('value')).toBe('name')
    expect(radio.props('value')).toBe('descend')

    await buttonByText(w, 'Lưu lại').trigger('click')
    expect(w.emitted('save')?.at(-1)).toEqual([
      {
        columnOrder: ['index', 'code', 'name', 'price'],
        hiddenColumns: [],
        defaultSort: { field: 'name', order: 'descend' },
      },
    ])
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('nháp lấy từ thiết lập; tắt rồi bật lại giữ cột đã chọn; tắt khi lưu → defaultSort null', async () => {
    const w = mountDrawer({
      settings: { columnOrder: [], hiddenColumns: ['price'], defaultSort: { field: 'name', order: 'descend' } },
    })
    const select = w.findComponent({ name: 'ASelect' })
    expect(sortSwitchOf(w).attributes('aria-checked')).toBe('true')
    expect(select.props('value')).toBe('name')
    expect(w.findComponent({ name: 'ARadioGroup' }).props('value')).toBe('descend')

    await sortSwitchOf(w).trigger('click')
    expect(select.props('disabled')).toBe(true)
    await sortSwitchOf(w).trigger('click')
    expect(select.props('value')).toBe('name')
    await sortSwitchOf(w).trigger('click')

    await buttonByText(w, 'Lưu lại').trigger('click')
    expect(w.emitted('save')?.at(-1)).toEqual([
      { columnOrder: ['index', 'code', 'name', 'price'], hiddenColumns: ['price'], defaultSort: null },
    ])
  })

  it('bảng không có cột sắp xếp được → không có tab, chỉ danh sách cột', () => {
    const w = mountDrawer({ columns: COLUMNS.map((column) => ({ ...column, sortField: null })) })
    expect(w.find('.segmented').exists()).toBe(false)
    expect(isShown(w, '.c-table-settings-drawer__columns')).toBe(true)
    expect(isShown(w, 'form')).toBe(false)
  })
})

describe('CTableSettingsDrawer — Đặt lại / đóng', () => {
  it('Đặt lại → nháp về cấu hình gốc, chưa lưu và drawer vẫn mở', async () => {
    const w = mountDrawer({
      settings: {
        columnOrder: ['index', 'price', 'name', 'code'],
        hiddenColumns: ['code'],
        defaultSort: { field: 'code', order: 'descend' },
      },
    })
    await buttonByText(w, 'Đặt lại').trigger('click')
    expect(labelsOf(w)).toEqual(['STT', 'Mã gói', 'Tên gói', 'Giá bán'])
    expect(switchOf(w, 'Mã gói').attributes('aria-checked')).toBe('true')
    expect(sortSwitchOf(w).attributes('aria-checked')).toBe('false')
    expect(w.findComponent({ name: 'ARadioGroup' }).props('value')).toBe('ascend')
    expect(w.emitted('save')).toBeUndefined()
    expect(w.emitted('update:open')).toBeUndefined()
  })

  it('đóng bằng ✕ → không lưu; mở lại → nháp lấy lại thiết lập và về tab Hiển thị cột', async () => {
    const w = mountDrawer()
    await moveButton(w, 'Mã gói', 'xuống').trigger('click')
    await w.findAll('.segment')[1]!.trigger('click')
    await w.find('.drawer-close').trigger('click')
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
    expect(w.emitted('save')).toBeUndefined()

    await w.setProps({ open: false })
    await w.setProps({ open: true })
    expect(labelsOf(w)).toEqual(['STT', 'Mã gói', 'Tên gói', 'Giá bán'])
    expect(w.findAll('.segment')[0]!.attributes('aria-pressed')).toBe('true')
    expect(announcementOf(w)).toBe('')

    await w.findAll('.segment')[1]!.trigger('click')
    expect(isShown(w, '.c-table-settings-drawer__columns')).toBe(false)
    await w.findAll('.segment')[0]!.trigger('click')
    expect(isShown(w, '.c-table-settings-drawer__columns')).toBe(true)
  })
})
