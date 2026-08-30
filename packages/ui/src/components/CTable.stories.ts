import type { Meta, StoryObj } from '@storybook/vue3'
import CTable from './CTable.vue'

const meta: Meta<typeof CTable> = {
  title: 'Components/CTable',
  component: CTable,
}
export default meta

type Story = StoryObj<typeof CTable>

export const Basic: Story = {
  render: () => ({
    components: { CTable },
    setup() {
      const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Tuổi', dataIndex: 'age', key: 'age' },
        { title: 'Phòng ban', dataIndex: 'dept', key: 'dept' },
      ]
      const dataSource = [
        { key: 1, name: 'An', age: 28, dept: 'Kỹ thuật' },
        { key: 2, name: 'Bình', age: 34, dept: 'Vận hành' },
        { key: 3, name: 'Cường', age: 41, dept: 'Tài chính' },
      ]
      return { columns, dataSource }
    },
    template: '<CTable :columns="columns" :data-source="dataSource" />',
  }),
}
