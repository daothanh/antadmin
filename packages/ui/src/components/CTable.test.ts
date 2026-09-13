/* eslint-disable vue/one-component-per-file -- nhiều stub antd trong 1 file test */
import { h, isProxy, nextTick, reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { TableFilterField } from '../internal/filter'

// Stub primitive antdv thành DOM tối giản để test logic wrapper (header/toolbar, ẩn cột,
// phân trang, forward slot) mà không kéo render antd nặng. CCard/CButton dùng stub này luôn.
vi.mock('ant-design-vue', async () => {
  const { Comment, Fragment, defineComponent, h, isVNode } = await import('vue')

  // Giống antdv: slot bodyCell trả rỗng (chỉ comment) thì dùng giá trị ô mặc định.
  function hasContent(nodes: unknown): boolean {
    return (Array.isArray(nodes) ? nodes : [nodes]).some((node) => {
      if (!isVNode(node)) return node !== undefined && node !== null && node !== ''
      if (node.type === Comment) return false
      if (node.type === Fragment) return hasContent(node.children)
      return true
    })
  }

  type Row = Record<string, unknown>
  type Col = { key?: string; dataIndex?: string }

  const Table = defineComponent({
    name: 'ATable',
    props: {
      columns: { type: Array, default: undefined },
      dataSource: { type: Array, default: undefined },
      pagination: { type: [Object, Boolean], default: undefined },
      rowClassName: { type: [String, Function], default: undefined },
      size: { type: String, default: undefined },
      onChange: { type: Function, default: undefined },
    },
    setup: (props, { slots, attrs }) => () =>
      h('table', { ...attrs, size: props.size }, [
        h(
          'tbody',
          ((props.dataSource ?? []) as Row[]).map((record, index) =>
            h(
              'tr',
              {
                class:
                  typeof props.rowClassName === 'function'
                    ? props.rowClassName(record, index, 0)
                    : props.rowClassName,
              },
              ((props.columns ?? []) as Col[]).map((column) => {
                const text = column.dataIndex ? record[column.dataIndex] : undefined
                const custom = slots.bodyCell?.({ column, record, index, text, value: text })
                return h(
                  'td',
                  { 'data-col': column.key ?? column.dataIndex },
                  hasContent(custom) ? custom : String(text ?? ''),
                )
              }),
            ),
          ),
        ),
        ...Object.entries(slots)
          .filter(([name]) => name !== 'bodyCell')
          .map(([name, slot]) =>
            h('caption', { 'data-slot': name }, slot?.({ column: { key: 'ten' } })),
          ),
      ]),
  })

  const Card = defineComponent({
    name: 'ACard',
    props: { bodyStyle: { type: Object, default: undefined }, bordered: Boolean },
    setup: (props, { slots, attrs }) => () =>
      h('div', { ...attrs, class: ['ant-card', attrs.class] }, [
        slots.title || slots.extra
          ? h('div', { class: 'card-head' }, [
              slots.title ? h('div', { class: 'card-title' }, slots.title()) : null,
              slots.extra ? h('div', { class: 'card-extra' }, slots.extra()) : null,
            ])
          : null,
        h('div', { class: 'card-body', style: props.bodyStyle }, slots.default?.()),
      ]),
  })

  const Collapse = defineComponent({
    name: 'ACollapse',
    setup: (_p, { slots }) => () => h('div', { class: 'collapse' }, slots.default?.()),
  })

  // Header bấm/Enter thì phát toggle — để kiểm tra toolbar không làm thu gọn nhầm.
  const CollapsePanel = defineComponent({
    name: 'ACollapsePanel',
    emits: ['toggle'],
    setup: (_p, { slots, emit }) => () =>
      h('div', { class: 'panel' }, [
        h(
          'div',
          { class: 'panel-header', onClick: () => emit('toggle'), onKeypress: () => emit('toggle') },
          [slots.header?.(), slots.extra?.()],
        ),
        h('div', { class: 'panel-body' }, slots.default?.()),
      ]),
  })

  const Button = defineComponent({
    name: 'AButton',
    setup: (_p, { slots, attrs }) => () =>
      h('button', { ...attrs }, [slots.icon?.(), slots.default?.()]),
  })

  // Nút .input-clear giả lập allow-clear: antdv phát change dạng click với value rỗng.
  const Input = defineComponent({
    name: 'AInput',
    props: { value: { type: String, default: '' } },
    emits: ['change', 'pressEnter'],
    setup: (props, { emit, attrs, slots }) => () =>
      h('span', { class: 'input' }, [
        slots.prefix?.(),
        h('input', {
          ...attrs,
          value: props.value,
          onChange: (e: Event) => emit('change', e),
          onKeyup: (e: KeyboardEvent) => e.key === 'Enter' && emit('pressEnter', e),
        }),
        h('button', {
          class: 'input-clear',
          onClick: () => emit('change', { type: 'click', target: { value: '' } }),
        }),
      ]),
  })

  const Badge = defineComponent({
    name: 'ABadge',
    props: { dot: Boolean },
    setup: (props, { slots }) => () =>
      h('span', { class: 'badge', 'data-dot': String(Boolean(props.dot)) }, slots.default?.()),
  })

  const Tooltip = defineComponent({
    name: 'ATooltip',
    props: { title: { type: String, default: undefined } },
    setup: (props, { slots }) => () =>
      h('span', { class: 'tooltip', 'data-title': props.title }, slots.default?.()),
  })

  const Popover = defineComponent({
    name: 'APopover',
    setup: (_p, { slots }) => () =>
      h('div', { class: 'popover' }, [
        h('div', { class: 'popover-title' }, slots.title?.()),
        h('div', { class: 'popover-content' }, slots.content?.()),
        slots.default?.(),
      ]),
  })

  const Checkbox = defineComponent({
    name: 'ACheckbox',
    props: { checked: Boolean, disabled: Boolean },
    emits: ['change'],
    setup: (props, { slots, emit }) => () =>
      h('label', { class: 'checkbox' }, [
        h('input', {
          type: 'checkbox',
          checked: props.checked,
          disabled: props.disabled,
          onChange: (e: Event) =>
            emit('change', { target: { checked: (e.target as HTMLInputElement).checked } }),
        }),
        slots.default?.(),
      ]),
  })

  return { Badge, Button, Card, Checkbox, Collapse, CollapsePanel, Input, Popover, Table, Tooltip }
})

// Drawer lọc có test riêng — ở đây chỉ cần props vào, sự kiện ra và slot của trường custom.
vi.mock('../internal/CTableFilterDrawer.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'CTableFilterDrawer',
      props: {
        open: Boolean,
        fields: { type: Array, default: () => [] },
        values: { type: Object, default: () => ({}) },
      },
      emits: ['update:open', 'apply'],
      setup: (props, { slots }) => () =>
        props.open
          ? h(
              'aside',
              { class: 'filter-drawer' },
              (props.fields as { key: string; type: string }[]).map((field) =>
                h(
                  'div',
                  { 'data-field': field.key },
                  field.type === 'custom' ? slots.field?.({ field, values: props.values }) : undefined,
                ),
              ),
            )
          : null,
    }),
  }
})

import CTable from './CTable.vue'

interface Row {
  id: number
  name: string
  age: number
  dept: string
}

const columns = [
  { title: 'Tên', dataIndex: 'name', key: 'name' },
  { title: 'Tuổi', dataIndex: 'age', key: 'age' },
  { title: 'Phòng ban', dataIndex: 'dept' },
]
const rows: Row[] = [
  { id: 1, name: 'An', age: 28, dept: 'Kỹ thuật' },
  { id: 2, name: 'Bình', age: 34, dept: 'Vận hành' },
  { id: 3, name: 'Cường', age: 41, dept: 'Tài chính' },
]

type Wrapper = ReturnType<typeof mount>
type ColumnProp = { key?: string; dataIndex?: string }

function tableOf(w: Wrapper) {
  return w.findComponent({ name: 'ATable' })
}
function columnKeys(w: Wrapper) {
  return (tableOf(w).props('columns') as ColumnProp[]).map((c) => c.key ?? c.dataIndex)
}
function buttonByText(w: Wrapper, text: string) {
  return w.findAll('button').find((b) => b.text() === text)!
}

describe('CTable — forward a-table', () => {
  it('mặc định size middle, override được qua attrs', () => {
    expect(mount(CTable).find('table').attributes('size')).toBe('middle')
    expect(mount(CTable, { attrs: { size: 'small' } }).find('table').attributes('size')).toBe('small')
  })

  it('class/style gắn vào khung ngoài, attr còn lại (kể cả kebab-case) xuống a-table', () => {
    const w = mount(CTable, {
      attrs: { class: 'my-table', style: 'margin-top: 4px', 'data-source': rows, bordered: true },
    })
    const root = w.find('.ant-card')
    expect(root.classes()).toEqual(expect.arrayContaining(['c-table', 'my-table']))
    expect(root.attributes('style')).toContain('margin-top: 4px')
    expect(tableOf(w).props('dataSource')).toEqual(rows)
    expect(w.find('table').attributes('bordered')).toBe('true')
    expect(w.find('table').classes()).not.toContain('my-table')
  })

  it('forward slot tên bất kỳ kèm slotProps; #title/#toolbar render ở header, không xuống Table', () => {
    const w = mount(CTable, {
      slots: {
        footer: (props: { column: { key: string } }) => h('i', props.column.key),
        title: '<b>tiêu đề</b>',
        toolbar: '<span class="my-tool">Nhập Excel</span>',
      },
    })
    expect(w.find('[data-slot=footer] i').text()).toBe('ten')
    expect(w.find('[data-slot=title]').exists()).toBe(false)
    expect(w.find('[data-slot=toolbar]').exists()).toBe(false)
    expect(w.find('.card-title b').text()).toBe('tiêu đề')
    expect(w.find('.c-table__toolbar .my-tool').exists()).toBe(true)
  })

  it('slot bodyCell nhận slotProps; ô không khớp slot giữ giá trị mặc định', () => {
    const w = mount(CTable, {
      attrs: { columns, dataSource: rows },
      slots: {
        bodyCell: ({ column, record }: { column: ColumnProp; record: Row }) =>
          column.key === 'name' ? h('b', record.name.toUpperCase()) : undefined,
      },
    })
    const cells = w.find('tbody tr').findAll('td')
    expect(cells[0]!.find('b').text()).toBe('AN')
    expect(cells[1]!.text()).toBe('28')
  })

  it('listener @change của trang xuống thẳng a-table', () => {
    const onChange = vi.fn()
    const handler = tableOf(mount(CTable, { attrs: { onChange } })).props('onChange')
    expect(handler).toBe(onChange)
  })

  it('không có columns → columns undefined để antdv tự lo (<a-table-column>)', () => {
    expect(tableOf(mount(CTable)).props('columns')).toBeUndefined()
    expect(columnKeys(mount(CTable, { attrs: { columns } }))).toEqual(['name', 'age', 'dept'])
  })
})

describe('CTable — header & toolbar', () => {
  it('không có tiêu đề/toolbar thì không render header', () => {
    expect(mount(CTable, { attrs: { columns } }).find('.card-head').exists()).toBe(false)
  })

  it('prop title hiện ở header; khung mặc định type default, có viền', () => {
    const w = mount(CTable, { props: { title: 'Danh sách phiên bản xe' } })
    expect(w.find('.c-card__title').text()).toBe('Danh sách phiên bản xe')
    expect(w.find('.ant-card').classes()).toContain('c-card-default')
    expect(w.find('.ant-card').classes()).not.toContain('c-card--borderless')
  })

  it('nút Thêm mới: đổi nhãn được, bấm → emit create', async () => {
    const w = mount(CTable, { props: { showCreate: true, createText: 'Tạo xe' } })
    await buttonByText(w, 'Tạo xe').trigger('click')
    expect(w.emitted('create')).toHaveLength(1)
  })

  it('ô tìm kiếm: gõ → update:searchValue, Enter → search với text đang gõ (không cần v-model)', async () => {
    const w = mount(CTable, { props: { showSearch: true, searchPlaceholder: 'Tìm mã xe' } })
    const input = w.find('.input input')
    expect(input.attributes('placeholder')).toBe('Tìm mã xe')
    await input.setValue('E22H')
    expect(w.emitted('update:searchValue')?.at(-1)).toEqual(['E22H'])
    await input.trigger('keyup', { key: 'Enter' })
    expect(w.emitted('search')?.at(-1)).toEqual(['E22H'])
  })

  it('ô tìm kiếm: đồng bộ theo prop searchValue; bấm xoá → search chuỗi rỗng', async () => {
    const w = mount(CTable, { props: { showSearch: true, searchValue: 'abc' } })
    expect((w.find('.input input').element as HTMLInputElement).value).toBe('abc')
    await w.setProps({ searchValue: 'xyz' })
    await w.find('.input input').trigger('keyup', { key: 'Enter' })
    expect(w.emitted('search')?.at(-1)).toEqual(['xyz'])
    await w.find('.input-clear').trigger('click')
    expect(w.emitted('update:searchValue')?.at(-1)).toEqual([''])
    expect(w.emitted('search')?.at(-1)).toEqual([''])
  })

  it('nút Lọc: chấm đỏ khi filterCount > 0, aria-label nêu số bộ lọc, bấm → emit filter', async () => {
    const w = mount(CTable, { props: { showFilter: true } })
    expect(w.find('.badge').attributes('data-dot')).toBe('false')
    expect(buttonByText(w, 'Lọc').attributes('aria-label')).toBe('Lọc')
    await w.setProps({ filterCount: 2 })
    expect(w.find('.badge').attributes('data-dot')).toBe('true')
    expect(buttonByText(w, 'Lọc').attributes('aria-label')).toBe('Lọc (đang áp dụng 2 bộ lọc)')
    await buttonByText(w, 'Lọc').trigger('click')
    expect(w.emitted('filter')).toHaveLength(1)
  })

  it('nút tròn Xuất / Tải lại emit sự kiện; icon tải lại xoay theo loading của bảng', async () => {
    const w = mount(CTable, { props: { showExport: true, showReload: true } })
    await w.find('[aria-label="Xuất dữ liệu"]').trigger('click')
    await w.find('[aria-label="Tải lại"]').trigger('click')
    expect(w.emitted('export')).toHaveLength(1)
    expect(w.emitted('reload')).toHaveLength(1)
    expect(w.find('.c-table__spin').exists()).toBe(false)

    const spinning = (loading: unknown) =>
      mount(CTable, { props: { showReload: true }, attrs: { loading } }).find('.c-table__spin').exists()
    expect(spinning(true)).toBe(true)
    expect(spinning('')).toBe(true)
    expect(spinning({ delay: 100 })).toBe(true)
    expect(spinning({ spinning: false })).toBe(false)
  })

  it('collapsible: click/Enter trong toolbar không làm thu gọn; không collapsible thì vẫn nổi bọt', async () => {
    const collapsed = mount(CTable, { props: { collapsible: true, title: 'Xe', showCreate: true } })
    await buttonByText(collapsed, 'Thêm mới').trigger('click')
    await collapsed.find('.c-table__toolbar').trigger('keypress', { key: 'Enter' })
    expect(collapsed.emitted('create')).toHaveLength(1)
    expect(collapsed.findComponent({ name: 'ACollapsePanel' }).emitted('toggle')).toBeUndefined()

    const plain = mount(CTable, { props: { showCreate: true } })
    const onRootClick = vi.fn()
    plain.find('.ant-card').element.addEventListener('click', onRootClick)
    await buttonByText(plain, 'Thêm mới').trigger('click')
    expect(onRootClick).toHaveBeenCalledTimes(1)
  })
})

describe('CTable — cài đặt cột', () => {
  function settingsOf(w: Wrapper) {
    return w.findAll('.c-table__settings label')
  }

  it('bỏ chọn cột → ẩn khỏi bảng + emit update:hiddenColumns; không cho ẩn cột cuối cùng', async () => {
    const w = mount(CTable, {
      props: { showColumnSetting: true },
      attrs: { columns: [...columns, { title: '', key: 'actions' }] },
    })
    // Cột tiện ích (title rỗng) không có trong danh sách ẩn/hiện.
    expect(settingsOf(w).map((l) => l.text())).toEqual(['Tên', 'Tuổi', 'Phòng ban'])

    await settingsOf(w)[1]!.find('input').setValue(false)
    expect(columnKeys(w)).toEqual(['name', 'dept', 'actions'])
    expect(w.emitted('update:hiddenColumns')?.at(-1)).toEqual([['age']])

    await settingsOf(w)[2]!.find('input').setValue(false)
    expect(columnKeys(w)).toEqual(['name', 'actions'])
    expect(settingsOf(w)[0]!.find('input').attributes('disabled')).toBeDefined()

    await settingsOf(w)[1]!.find('input').setValue(true)
    expect(columnKeys(w)).toEqual(['name', 'age', 'actions'])
    expect(w.emitted('update:hiddenColumns')?.at(-1)).toEqual([['dept']])
  })

  it('Đặt lại hiện toàn bộ cột; hiddenColumns controlled đồng bộ theo prop', async () => {
    const w = mount(CTable, {
      props: { showColumnSetting: true, hiddenColumns: ['age'] },
      attrs: { columns },
    })
    expect(columnKeys(w)).toEqual(['name', 'dept'])
    await w.setProps({ hiddenColumns: ['name', 'dept'] })
    expect(columnKeys(w)).toEqual(['age'])
    await w.setProps({ hiddenColumns: undefined })
    expect(columnKeys(w)).toEqual(['name', 'age', 'dept'])
    expect(buttonByText(w, 'Đặt lại').attributes('disabled')).toBeDefined()

    await w.setProps({ hiddenColumns: ['dept'] })
    await buttonByText(w, 'Đặt lại').trigger('click')
    expect(columnKeys(w)).toEqual(['name', 'age', 'dept'])
    expect(w.emitted('update:hiddenColumns')?.at(-1)).toEqual([[]])
  })
})

describe('CTable — phân trang & dòng xen kẽ', () => {
  it('phân trang chuẩn: Tổng số dòng, chọn số dòng/trang, cỡ mặc định', () => {
    const pagination = tableOf(mount(CTable)).props('pagination') as Record<string, unknown>
    expect((pagination.showTotal as (n: number) => string)(351)).toBe('Tổng số dòng 351')
    expect(pagination).toMatchObject({ showSizeChanger: true, size: 'default' })
  })

  it('cấu hình của trang ghi đè từng key; pagination=false giữ nguyên', () => {
    const w = mount(CTable, { attrs: { pagination: { current: 2, pageSize: 25, showSizeChanger: false } } })
    expect(tableOf(w).props('pagination')).toMatchObject({
      current: 2,
      pageSize: 25,
      showSizeChanger: false,
      size: 'default',
    })
    expect(tableOf(mount(CTable, { attrs: { pagination: false } })).props('pagination')).toBe(false)
  })

  it('striped: thêm lớp cho dòng thứ 2, 4…; gộp rowClassName của trang', () => {
    const w = mount(CTable, {
      props: { striped: true },
      attrs: { columns, dataSource: rows, rowClassName: (r: Row) => `row-${r.id}` },
    })
    expect(w.find('.ant-card').classes()).toContain('c-table--striped')
    expect(w.findAll('tbody tr').map((tr) => tr.classes())).toEqual([
      ['row-1'],
      ['row-2', 'c-table__row--striped'],
      ['row-3'],
    ])
    const plain = mount(CTable, { attrs: { columns, dataSource: rows, 'row-class-name': 'hang' } })
    expect(plain.findAll('tbody tr').map((tr) => tr.classes())).toEqual([['hang'], ['hang'], ['hang']])
    expect(tableOf(mount(CTable, { attrs: { columns } })).props('rowClassName')).toBeUndefined()
  })
})

describe('CTable — bộ lọc dựng sẵn', () => {
  const filterFields: TableFilterField[] = [
    {
      key: 'dept',
      label: 'Phòng ban',
      type: 'select',
      multiple: true,
      options: [
        { label: 'Kỹ thuật', value: 'kt' },
        { label: 'Vận hành', value: 'vh' },
      ],
    },
    { key: 'joinedAt', label: 'Ngày vào', type: 'dateRange' },
    { key: 'name', label: 'Tên', type: 'input' },
  ]
  const JOINED = ['2026-09-01', '2026-09-13']

  function drawerOf(w: Wrapper) {
    return w.findComponent({ name: 'CTableFilterDrawer' })
  }
  function conditionTexts(w: Wrapper) {
    return w.findAll('.c-table__filter-list li').map((li) => li.text())
  }
  function removeButtons(w: Wrapper) {
    return w.findAll('.c-table__filter-list button')
  }

  it('không có filterFields → bấm Lọc chỉ emit filter, không có drawer/thanh điều kiện (hành vi cũ)', async () => {
    const w = mount(CTable, { props: { showFilter: true, filterValues: { name: 'An' } } })
    await buttonByText(w, 'Lọc').trigger('click')
    expect(w.emitted('filter')).toHaveLength(1)
    expect(drawerOf(w).exists()).toBe(false)
    expect(w.find('.c-table__filters').exists()).toBe(false)
    expect(buttonByText(w, 'Lọc').attributes('aria-haspopup')).toBeUndefined()
  })

  it('có filterFields → bấm Lọc mở drawer (vẫn emit filter), drawer nhận trường + bộ lọc đang áp dụng', async () => {
    const w = mount(CTable, { props: { showFilter: true, filterFields, filterValues: { name: 'An' } } })
    expect(drawerOf(w).props('open')).toBe(false)
    expect(buttonByText(w, 'Lọc').attributes('aria-haspopup')).toBe('dialog')
    await buttonByText(w, 'Lọc').trigger('click')
    expect(w.emitted('filter')).toHaveLength(1)
    expect(drawerOf(w).props()).toMatchObject({ open: true, fields: filterFields, values: { name: 'An' } })
  })

  it('Áp dụng → emit update:filterValues, hiện thẻ điều kiện; badge đếm theo điều kiện, bỏ qua filterCount', async () => {
    const w = mount(CTable, { props: { showFilter: true, filterFields, filterCount: 5 } })
    expect(w.find('.c-table__filters').exists()).toBe(false)
    expect(w.find('.badge').attributes('data-dot')).toBe('false')

    drawerOf(w).vm.$emit('apply', { dept: ['kt', 'vh'], joinedAt: JOINED })
    await nextTick()
    expect(w.emitted('update:filterValues')?.at(-1)).toEqual([{ dept: ['kt', 'vh'], joinedAt: JOINED }])
    expect(conditionTexts(w)).toEqual([
      'Phòng ban: Kỹ thuật, Vận hành',
      'Ngày vào: 01/09/2026 – 13/09/2026',
    ])
    expect(removeButtons(w)[0]!.attributes('aria-label')).toBe('Bỏ lọc Phòng ban: Kỹ thuật, Vận hành')
    expect(w.find('.badge').attributes('data-dot')).toBe('true')
    expect(buttonByText(w, 'Lọc').attributes('aria-label')).toBe('Lọc (đang áp dụng 2 bộ lọc)')
    // Không bind v-model → CTable tự giữ bộ lọc đã áp dụng cho lần mở drawer sau.
    expect(drawerOf(w).props('values')).toEqual({ dept: ['kt', 'vh'], joinedAt: JOINED })
  })

  it('bấm ✕ trên thẻ → bỏ điều kiện đó, focus sang thẻ kế; bỏ thẻ cuối → focus về nút Lọc', async () => {
    const w = mount(CTable, {
      props: { showFilter: true, filterFields, filterValues: { name: 'An', dept: ['kt'], joinedAt: JOINED } },
      attachTo: document.body,
    })
    expect(conditionTexts(w)).toEqual(['Phòng ban: Kỹ thuật', 'Ngày vào: 01/09/2026 – 13/09/2026', 'Tên: An'])

    await removeButtons(w)[0]!.trigger('click')
    await flushPromises()
    expect(w.emitted('update:filterValues')?.at(-1)).toEqual([{ name: 'An', joinedAt: JOINED }])
    expect(conditionTexts(w)).toEqual(['Ngày vào: 01/09/2026 – 13/09/2026', 'Tên: An'])
    expect(document.activeElement).toBe(removeButtons(w)[0]!.element)

    await removeButtons(w)[1]!.trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(removeButtons(w)[0]!.element)

    await removeButtons(w)[0]!.trigger('click')
    await flushPromises()
    expect(w.emitted('update:filterValues')?.at(-1)).toEqual([{}])
    expect(w.find('.c-table__filters').exists()).toBe(false)
    expect(document.activeElement).toBe(buttonByText(w, 'Lọc').element)
    w.unmount()
  })

  it('Xoá tất cả → emit {} + ẩn thanh điều kiện + focus về nút Lọc', async () => {
    const w = mount(CTable, {
      props: { showFilter: true, filterFields, filterValues: { name: 'An', dept: ['kt'] } },
      attachTo: document.body,
    })
    await buttonByText(w, 'Xoá tất cả').trigger('click')
    await flushPromises()
    expect(w.emitted('update:filterValues')?.at(-1)).toEqual([{}])
    expect(w.find('.c-table__filters').exists()).toBe(false)
    expect(document.activeElement).toBe(buttonByText(w, 'Lọc').element)
    w.unmount()
  })

  it('đóng drawer → focus trả về nút Lọc', async () => {
    const w = mount(CTable, { props: { showFilter: true, filterFields }, attachTo: document.body })
    await buttonByText(w, 'Lọc').trigger('click')
    drawerOf(w).vm.$emit('update:open', false)
    await flushPromises()
    expect(drawerOf(w).props('open')).toBe(false)
    expect(document.activeElement).toBe(buttonByText(w, 'Lọc').element)
    w.unmount()
  })

  it('giá trị phát ra khi bỏ thẻ là object thường, kể cả khi trang truyền object reactive', async () => {
    const filterValues = reactive({ dept: ['kt', 'vh'], name: 'An' })
    const w = mount(CTable, { props: { filterFields, filterValues } })
    await removeButtons(w)[1]!.trigger('click')
    const [emitted] = w.emitted<[Record<string, unknown>]>('update:filterValues')!.at(-1)!
    expect(emitted).toEqual({ dept: ['kt', 'vh'] })
    expect(isProxy(emitted.dept)).toBe(false)
  })

  it('filterValues controlled đồng bộ theo prop; key không khai báo vẫn có thẻ (nhãn = key)', async () => {
    const w = mount(CTable, { props: { filterFields, filterValues: { name: 'An' } } })
    expect(conditionTexts(w)).toEqual(['Tên: An'])
    await w.setProps({ filterValues: { dealerId: 'D01', name: '' } })
    expect(conditionTexts(w)).toEqual(['dealerId: D01'])
    await w.setProps({ filterValues: undefined })
    expect(w.find('.c-table__filters').exists()).toBe(false)
  })

  it('slot #filterField render trong drawer cho trường custom, không forward xuống a-table', async () => {
    const w = mount(CTable, {
      props: { showFilter: true, filterFields: [{ key: 'dealer', label: 'Đại lý', type: 'custom' }] },
      slots: {
        filterField: ({ field }: { field: TableFilterField }) => h('i', { class: 'dealer-picker' }, field.label),
      },
    })
    await buttonByText(w, 'Lọc').trigger('click')
    expect(w.find('.filter-drawer .dealer-picker').text()).toBe('Đại lý')
    expect(w.find('[data-slot=filterField]').exists()).toBe(false)
  })

  it('trường custom thiếu slot #filterField → báo lỗi dùng sai API', () => {
    // Vue in cảnh báo "Unhandled error" trước khi ném lại lỗi — tắt để log test gọn.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      mount(CTable, { props: { filterFields: [{ key: 'dealer', label: 'Đại lý', type: 'custom' }] } }),
    ).toThrow('[@antadmin/ui] CTable: trường lọc type "custom" cần slot #filterField')
    warn.mockRestore()
  })
})
