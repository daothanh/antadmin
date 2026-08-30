import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { loadKnowledge, loadVersion } from './data'
import { createServer } from './server'

// Điểm vào thư viện + runtime. `main()` được bin/cli.mjs gọi để chạy stdio.
export { createServer } from './server'
export { loadKnowledge, loadVersion } from './data'
export type {
  ComponentMeta,
  DocEntry,
  Knowledge,
  PackageMeta,
  PropInfo,
  TokenSet,
} from './types'

/** Khởi động MCP server trên stdio (dùng cho .mcp.json của team sản phẩm). */
export async function main(): Promise<void> {
  const server = createServer(loadKnowledge(), loadVersion())
  await server.connect(new StdioServerTransport())
}
