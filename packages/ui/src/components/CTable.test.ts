/* eslint-disable vue/one-component-per-file -- nhiều stub antd trong 1 file test */
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

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
