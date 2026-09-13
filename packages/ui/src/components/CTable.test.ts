/* eslint-disable vue/one-component-per-file -- nhiều stub antd trong 1 file test */
import { h, isProxy, nextTick, reactive } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { TableSettings } from '@antadmin/utils'
import type { TableFilterField } from '../internal/filter'

// Stub primitive antdv thành DOM tối giản để test logic wrapper (header/toolbar, thiết lập cột,
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

  return { Badge, Button, Card, Collapse, CollapsePanel, Input, Table, Tooltip }
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

// Drawer thiết lập có test riêng — ở đây chỉ cần props vào và sự kiện save/update:open ra.
vi.mock('../internal/CTableSettingsDrawer.vue', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'CTableSettingsDrawer',
      props: {
        open: Boolean,
        columns: { type: Array, default: () => [] },
        settings: { type: Object, default: undefined },
      },
      emits: ['update:open', 'save'],
      setup: (props) => () => (props.open ? h('aside', { class: 'settings-drawer' }) : null),
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
type ColumnProp = { key?: string; dataIndex?: string; sortOrder?: string | null }

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

  it('@change của a-table được chuyển tiếp nguyên tham số tới trang', () => {
    const onChange = vi.fn()
    const w = mount(CTable, { attrs: { onChange } })
    const args = [{ current: 2, pageSize: 20 }, { dept: ['kt'] }, {}, { action: 'paginate', currentDataSource: [] }]
    const tableChange = tableOf(w).props('onChange') as (...params: unknown[]) => void
    tableChange(...args)
    expect(onChange).toHaveBeenCalledWith(...args)
    expect(w.emitted('change')).toEqual([args])
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

describe('CTable — thiết lập', () => {
  // Tên + Tuổi sắp xếp được; Phòng ban không key (dùng dataIndex); cột ⋮ tiện ích.
  const settingColumns = [
    { title: 'Tên', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Tuổi', dataIndex: 'age', key: 'age', sorter: true },
    { title: 'Phòng ban', dataIndex: 'dept' },
    { title: '', key: 'actions' },
  ]

  afterEach(() => {
    localStorage.clear()
  })

  function saveToStorage(settingsKey: string, settings: TableSettings) {
    localStorage.setItem(`antadmin:table:${settingsKey}`, JSON.stringify({ version: 1, ...settings }))
  }
  function storedOf(settingsKey: string): unknown {
    return JSON.parse(localStorage.getItem(`antadmin:table:${settingsKey}`) ?? 'null')
  }
  function drawerOf(w: Wrapper) {
    return w.findComponent({ name: 'CTableSettingsDrawer' })
  }
  function settingsButtonOf(w: Wrapper) {
    return w.find('[aria-label="Thiết lập bảng"]')
  }
  function sortOrdersOf(w: Wrapper) {
    return (tableOf(w).props('columns') as ColumnProp[]).map((column) => column.sortOrder)
  }
  function save(w: Wrapper, settings: TableSettings) {
    drawerOf(w).vm.$emit('save', settings)
    return nextTick()
  }

  it('nút Thiết lập mở drawer với cột cấu hình được + thiết lập gốc; không có columns thì không có nút', async () => {
    const w = mount(CTable, { props: { showColumnSetting: true }, attrs: { columns: settingColumns } })
    expect(w.find('[data-title="Thiết lập"]').exists()).toBe(true)
    expect(settingsButtonOf(w).attributes('aria-haspopup')).toBe('dialog')
    expect(drawerOf(w).props('open')).toBe(false)

    await settingsButtonOf(w).trigger('click')
    expect(drawerOf(w).props()).toEqual({
      open: true,
      columns: [
        { key: 'name', label: 'Tên', pin: 'none', sortField: 'name' },
        { key: 'age', label: 'Tuổi', pin: 'none', sortField: 'age' },
        { key: 'dept', label: 'Phòng ban', pin: 'none', sortField: null },
      ],
      settings: { columnOrder: [], hiddenColumns: [], defaultSort: null },
    })

    const bare = mount(CTable, { props: { showColumnSetting: true } })
    expect(settingsButtonOf(bare).exists()).toBe(false)
    expect(drawerOf(bare).exists()).toBe(false)
  })

  it('Lưu lại → xếp/ẩn cột trên bảng (cột tiện ích giữ chỗ), emit update:settings đã chuẩn hoá; đóng drawer trả focus', async () => {
    const w = mount(CTable, {
      props: { showColumnSetting: true },
      attrs: { columns: settingColumns },
      attachTo: document.body,
    })
    await settingsButtonOf(w).trigger('click')
    await save(w, { columnOrder: ['dept', 'name', 'age'], hiddenColumns: ['age', 'gone'], defaultSort: null })

    const applied = { columnOrder: ['dept', 'name', 'age'], hiddenColumns: ['age'], defaultSort: null }
    expect(columnKeys(w)).toEqual(['dept', 'name', 'actions'])
    expect(w.emitted('update:settings')).toEqual([[applied]])
    expect(drawerOf(w).props('settings')).toEqual(applied)
    // Không đổi sắp xếp mặc định → không phát change, không tải lại.
    expect(w.emitted('change')).toBeUndefined()

    drawerOf(w).vm.$emit('update:open', false)
    await flushPromises()
    expect(drawerOf(w).props('open')).toBe(false)
    expect(document.activeElement).toBe(settingsButtonOf(w).element)
    w.unmount()
  })

  it('settingsKey: dựng bảng theo thiết lập đã lưu; Lưu lại ghi localStorage, trùng cấu hình gốc thì xoá key', async () => {
    saveToStorage('staff', { columnOrder: ['age', 'name', 'dept'], hiddenColumns: ['dept'], defaultSort: null })
    const w = mount(CTable, {
      props: { showColumnSetting: true, settingsKey: 'staff' },
      attrs: { columns: settingColumns },
    })
    expect(columnKeys(w)).toEqual(['age', 'name', 'actions'])

    await save(w, { columnOrder: ['name', 'age', 'dept'], hiddenColumns: ['name'], defaultSort: null })
    expect(storedOf('staff')).toEqual({ version: 1, columnOrder: [], hiddenColumns: ['name'], defaultSort: null })
    expect(columnKeys(w)).toEqual(['age', 'dept', 'actions'])

    await save(w, { columnOrder: [], hiddenColumns: [], defaultSort: null })
    expect(localStorage.getItem('antadmin:table:staff')).toBeNull()
    expect(columnKeys(w)).toEqual(['name', 'age', 'dept', 'actions'])
  })

  it('nhiều CTable trên một trang: mỗi settingsKey một thiết lập riêng, lưu bảng này không đụng bảng kia', async () => {
    saveToStorage('orders', { columnOrder: [], hiddenColumns: ['age'], defaultSort: null })
    const w = mount({
      render: () =>
        h('div', [
          h(CTable, { settingsKey: 'orders', showColumnSetting: true, columns: settingColumns }),
          h(CTable, { settingsKey: 'orders:items', showColumnSetting: true, columns: settingColumns }),
        ]),
    })
    const [orders, items] = w.findAllComponents(CTable)
    expect(columnKeys(orders!)).toEqual(['name', 'dept', 'actions'])
    expect(columnKeys(items!)).toEqual(['name', 'age', 'dept', 'actions'])

    await save(items!, { columnOrder: [], hiddenColumns: ['dept'], defaultSort: null })
    expect(storedOf('orders:items')).toMatchObject({ hiddenColumns: ['dept'] })
    expect(storedOf('orders')).toMatchObject({ hiddenColumns: ['age'] })
    expect(columnKeys(orders!)).toEqual(['name', 'dept', 'actions'])
    expect(columnKeys(items!)).toEqual(['name', 'age', 'actions'])
  })

  it('thiết lập đã lưu hỏng/khác version → cấu hình gốc; đổi settingsKey → nạp thiết lập của khoá mới', async () => {
    localStorage.setItem('antadmin:table:broken', '{hỏng')
    localStorage.setItem('antadmin:table:old', JSON.stringify({ version: 0, hidden: ['name'] }))
    saveToStorage('next', { columnOrder: [], hiddenColumns: ['name'], defaultSort: null })
    const w = mount(CTable, { props: { settingsKey: 'broken' }, attrs: { columns: settingColumns } })
    expect(columnKeys(w)).toEqual(['name', 'age', 'dept', 'actions'])
    await w.setProps({ settingsKey: 'old' })
    expect(columnKeys(w)).toEqual(['name', 'age', 'dept', 'actions'])
    await w.setProps({ settingsKey: 'next' })
    expect(columnKeys(w)).toEqual(['age', 'dept', 'actions'])
  })

  it('v-model:settings: prop thắng storage và đồng bộ theo prop; bỏ bind → quay về storage', async () => {
    saveToStorage('staff', { columnOrder: [], hiddenColumns: ['name'], defaultSort: null })
    const w = mount(CTable, {
      props: {
        showColumnSetting: true,
        settingsKey: 'staff',
        settings: { columnOrder: [], hiddenColumns: ['dept'], defaultSort: null },
      },
      attrs: { columns: settingColumns },
    })
    expect(columnKeys(w)).toEqual(['name', 'age', 'actions'])
    await w.setProps({ settings: { columnOrder: ['age', 'name', 'dept'], hiddenColumns: [], defaultSort: null } })
    expect(columnKeys(w)).toEqual(['age', 'name', 'dept', 'actions'])
    await w.setProps({ settings: undefined })
    expect(columnKeys(w)).toEqual(['age', 'dept', 'actions'])
  })

  it('lưu thiết lập mà cột cấu hình được thiếu key/dataIndex → báo lỗi dùng sai API; không lưu thì cho phép', () => {
    const columns = [...settingColumns, { title: 'Thao tác' }]
    // Vue in cảnh báo "Unhandled error" trước khi ném lại lỗi — tắt để log test gọn.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => mount(CTable, { props: { settingsKey: 'staff' }, attrs: { columns } })).toThrow(
      '[@antadmin/ui] CTable: cột "Thao tác" cần `key` hoặc `dataIndex` để lưu thiết lập',
    )
    const settings = { columnOrder: [], hiddenColumns: [], defaultSort: null }
    expect(() => mount(CTable, { props: { settings }, attrs: { columns } })).toThrow('cần `key` hoặc `dataIndex`')
    warn.mockRestore()
    expect(() => mount(CTable, { props: { showColumnSetting: true }, attrs: { columns } })).not.toThrow()
  })

  it('sắp xếp mặc định: sortOrder theo thiết lập, bấm tiêu đề cột cập nhật; lưu sắp xếp mới → phát change về trang 1', async () => {
    saveToStorage('staff', { columnOrder: [], hiddenColumns: [], defaultSort: { field: 'age', order: 'descend' } })
    const onChange = vi.fn()
    const w = mount(CTable, {
      props: { showColumnSetting: true, settingsKey: 'staff' },
      attrs: { columns: settingColumns, dataSource: rows, pagination: { current: 3, pageSize: 10, total: 30 }, onChange },
    })
    expect(sortOrdersOf(w)).toEqual([null, 'descend', undefined, undefined])

    // Người dùng bấm tiêu đề cột Tên: a-table phát change → chỉ báo đổi theo, sự kiện chuyển tiếp cho trang.
    const tableChange = tableOf(w).props('onChange') as (...params: unknown[]) => void
    tableChange({ current: 3, pageSize: 10 }, { dept: ['kt'] }, { field: 'name', order: 'ascend' }, { action: 'sort' })
    await nextTick()
    expect(sortOrdersOf(w)).toEqual(['ascend', null, undefined, undefined])
    expect(onChange).toHaveBeenCalledTimes(1)

    // Lưu thiết lập mà sắp xếp mặc định giữ nguyên → giữ sắp xếp đang xem, không phát change.
    await save(w, { columnOrder: ['age', 'name', 'dept'], hiddenColumns: [], defaultSort: { field: 'age', order: 'descend' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(sortOrdersOf(w)).toEqual([null, 'ascend', undefined, undefined])

    await save(w, { columnOrder: [], hiddenColumns: [], defaultSort: { field: 'name', order: 'descend' } })
    expect(onChange).toHaveBeenCalledTimes(2)
    const [pagination, filters, sorter, extra] = onChange.mock.calls[1] ?? []
    expect(pagination).toMatchObject({ current: 1, pageSize: 10, total: 30 })
    expect(filters).toEqual({ dept: ['kt'] })
    expect(sorter).toEqual({ column: settingColumns[0], columnKey: 'name', field: 'name', order: 'descend' })
    expect(extra).toEqual({ action: 'sort', currentDataSource: rows })
    expect(sortOrdersOf(w)).toEqual(['descend', null, undefined, undefined])

    // Tắt sắp xếp mặc định → change với sorter rỗng (useTable bỏ sortField/sortOrder).
    await save(w, { columnOrder: [], hiddenColumns: [], defaultSort: null })
    expect(onChange.mock.calls[2]?.[2]).toEqual({})
    expect(sortOrdersOf(w)).toEqual([null, null, undefined, undefined])
    expect(storedOf('staff')).toBeNull()
  })

  it('bảng tắt phân trang, không có dataSource → change tự phát có pagination rỗng, currentDataSource []', async () => {
    const w = mount(CTable, { props: { showColumnSetting: true }, attrs: { columns: settingColumns, pagination: false } })
    await save(w, { columnOrder: [], hiddenColumns: [], defaultSort: { field: 'age', order: 'ascend' } })
    expect(w.emitted('change')?.at(-1)).toEqual([
      {},
      {},
      { column: settingColumns[1], columnKey: 'age', field: 'age', order: 'ascend' },
      { action: 'sort', currentDataSource: [] },
    ])
  })

  it('không đụng sortOrder khi không dùng thiết lập hoặc trang tự điều khiển; defaultSortOrder của cột là sắp xếp ban đầu', () => {
    expect(sortOrdersOf(mount(CTable, { attrs: { columns: settingColumns } }))).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ])
    const pageControlled = [{ ...settingColumns[0], sortOrder: 'ascend' }, settingColumns[1]]
    expect(
      sortOrdersOf(mount(CTable, { props: { showColumnSetting: true }, attrs: { columns: pageControlled } })),
    ).toEqual(['ascend', undefined])
    const withDefault = [settingColumns[0], { ...settingColumns[1], defaultSortOrder: 'ascend' }]
    expect(sortOrdersOf(mount(CTable, { props: { showColumnSetting: true }, attrs: { columns: withDefault } }))).toEqual([
      null,
      'ascend',
    ])
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
