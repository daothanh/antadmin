// Kiểu dữ liệu tri thức framework mà MCP server phơi ra. Tất cả được sinh lúc
// build vào data/*.json (xem scripts/generate.ts) để server chạy standalone
// trong repo sản phẩm — không đọc live từ monorepo core.

/** Một prop của component C*. */
export interface PropInfo {
  name: string
  /** Kiểu TS thô (giữ nguyên union/array cho AI đọc). */
  type: string
  optional: boolean
  /** Giá trị mặc định (thô) nếu có trong withDefaults. */
  default?: string
  /** JSDoc/comment mô tả nếu có. */
  description?: string
}

/** Metadata một component C* trích từ SFC. */
export interface ComponentMeta {
  name: string
  /** Mô tả lấy từ comment đầu <script setup>. */
  description: string
  props: PropInfo[]
  /** Tên các sự kiện emit (nếu khai báo defineEmits). */
  emits: string[]
  /** Đường dẫn file (tương đối repo core) để tham chiếu. */
  path: string
}

/** Tập design token theo mode. */
export interface TokenSet {
  light: Record<string, string>
  dark: Record<string, string>
}

/** Một trang/section tài liệu để tìm kiếm. */
export interface DocEntry {
  title: string
  /** Đường dẫn tương đối (docs/... hoặc CLAUDE.md). */
  path: string
  content: string
}

/** Metadata một package @antadmin/*. */
export interface PackageMeta {
  name: string
  version: string
  description: string
}

/** Toàn bộ tri thức nạp vào server. */
export interface Knowledge {
  components: ComponentMeta[]
  tokens: TokenSet
  docs: DocEntry[]
  packages: PackageMeta[]
}
