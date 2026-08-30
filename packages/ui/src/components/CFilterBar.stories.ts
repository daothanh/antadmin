import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Select } from 'ant-design-vue'
import CFilterBar from './CFilterBar.vue'

const meta: Meta<typeof CFilterBar> = {
  title: 'Components/CFilterBar',
  component: CFilterBar,
  argTypes: {
    searchPlaceholder: { control: 'text' },
    showSearch: { control: 'boolean' },
    showReset: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof CFilterBar>

export const Playground: Story = {
  args: { searchPlaceholder: 'Tìm mã đơn, khách hàng…' },
  render: (args) => ({
    components: { CFilterBar },
    setup() {
      const keyword = ref('')
      const log = ref('')
      return { args, keyword, log }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <CFilterBar
          v-bind="args"
          v-model:search-value="keyword"
          @search="(v) => (log = 'search: ' + v)"
          @reset="log = 'reset'"
        />
        <div style="font-size:13px;color:var(--antadmin-color-text-muted)">{{ log || 'Bấm Lọc / Xoá lọc…' }}</div>
      </div>
    `,
  }),
}

export const WithFilters: Story = {
  name: 'Kèm control lọc (slot)',
  render: () => ({
    components: { CFilterBar, ASelect: Select },
    setup() {
      const keyword = ref('')
      const status = ref<string | undefined>(undefined)
      const options = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Ngừng' },
      ]
      return { keyword, status, options }
    },
    template: `
      <CFilterBar v-model:search-value="keyword" @search="() => {}" @reset="status = undefined">
        <ASelect v-model:value="status" placeholder="Trạng thái" allow-clear style="width:160px" :options="options" />
      </CFilterBar>
    `,
  }),
}
