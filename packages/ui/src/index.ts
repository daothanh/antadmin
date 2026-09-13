// ───────────────────────────────────────────────────────────────────────────
// Component thương hiệu AntAdmin (có style riêng, bám design token).
// ───────────────────────────────────────────────────────────────────────────
export { default as CAppLayout } from './components/CAppLayout.vue'
export { default as CButton } from './components/CButton.vue'
export { default as CCard } from './components/CCard.vue'
export { default as CChat } from './components/CChat.vue'
export type { ChatMessage, ChatRole } from './components/CChat.vue'
export { default as CChatMessage } from './components/CChatMessage.vue'
export { default as CEmpty } from './components/CEmpty.vue'
export { default as CFilterBar } from './components/CFilterBar.vue'
export { default as CSideNav } from './components/CSideNav.vue'
export type { NavItem } from './components/CSideNav.vue'
export { default as CForm } from './components/CForm.vue'
export { default as CInputCurrency } from './components/CInputCurrency.vue'
export { default as CInputPercent } from './components/CInputPercent.vue'
export { default as CPageHeader } from './components/CPageHeader.vue'
export type { BreadcrumbRoute } from './components/CPageHeader.vue'
export { default as CStatistic } from './components/CStatistic.vue'
export { default as CStatus } from './components/CStatus.vue'
export { default as CTable } from './components/CTable.vue'
export type { TableFilterField, TableFilterOption, TableFilterValues } from './internal/filter'
export { default as CTag } from './components/CTag.vue'
export { default as CTopNav } from './components/CTopNav.vue'

// Composable UI (phụ thuộc antd — không đặt ở @antadmin/composables).
export { useConfirm } from './useConfirm'
export type { ConfirmOptions } from './useConfirm'
export { useErrorHandler } from './useErrorHandler'
export type { ErrorHandlerHooks, HandleErrorOptions } from './useErrorHandler'

// Plugin + map components (layer gọi app.use(AntAdminUI)).
export { AntAdminUI, components } from './install'
export { default } from './install'

// ───────────────────────────────────────────────────────────────────────────
// Re-export CÓ KIỂM SOÁT primitive antdv (đặt bí danh C*). Team sản phẩm import
// từ @antadmin/ui thay vì 'ant-design-vue' (ESLint chặn import trực tiếp). Những
// component này không cần wrap thêm — chỉ chuẩn hoá điểm import.
// ───────────────────────────────────────────────────────────────────────────
export {
  // Layout
  Row,
  Col,
  Space,
  Flex,
  Divider,
  Typography,
  Layout,
  // Nhập liệu
  Input as CInput,
  Textarea as CTextarea,
  InputNumber as CInputNumber,
  InputSearch as CInputSearch,
  Select as CSelect,
  SelectOption as CSelectOption,
  Checkbox as CCheckbox,
  CheckboxGroup as CCheckboxGroup,
  RadioGroup as CRadioGroup,
  Radio as CRadio,
  Switch as CSwitch,
  DatePicker as CDatePicker,
  RangePicker as CRangePicker,
  TimePicker as CTimePicker,
  FormItem as CFormItem,
  Upload as CUpload,
  // Hiển thị dữ liệu
  Descriptions as CDescriptions,
  DescriptionsItem as CDescriptionsItem,
  Badge as CBadge,
  Avatar as CAvatar,
  Tabs as CTabs,
  TabPane as CTabPane,
  Collapse as CCollapse,
  CollapsePanel as CCollapsePanel,
  Tooltip as CTooltip,
  Popover as CPopover,
  Pagination as CPagination,
  Steps as CSteps,
  Step as CStep,
  Tree as CTree,
  // Phản hồi
  Modal as CModal,
  Drawer as CDrawer,
  Popconfirm as CPopconfirm,
  Result as CResult,
  Spin as CSpin,
  Skeleton as CSkeleton,
  Alert as CAlert,
  Progress as CProgress,
  // Điều hướng
  Dropdown as CDropdown,
  Menu as CMenu,
  MenuItem as CMenuItem,
  Breadcrumb as CBreadcrumb,
  BreadcrumbItem as CBreadcrumbItem,
} from 'ant-design-vue'

// Tiện ích lệnh (imperative API) — message/notification + Modal.confirm.
export { message, notification } from 'ant-design-vue'
