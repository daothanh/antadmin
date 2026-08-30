#!/usr/bin/env node
// Launcher mỏng — nạp server đã build và chạy stdio. Tách khỏi bundle để giữ
// shebang ổn định (rollup có thể bỏ shebang trong entry).
import { main } from '../dist/index.mjs'

main().catch((err) => {
  console.error('[antadmin-mcp] khởi động thất bại:', err)
  process.exit(1)
})
