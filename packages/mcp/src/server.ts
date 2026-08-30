import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchDocs } from './docs'
import { formatComponentDetail, formatComponentSummary, formatPackages } from './format'
import { formatTokens } from './tokens'
import type { Knowledge } from './types'

const NAME = 'antadmin-framework'

function text(body: string) {
  return { content: [{ type: 'text' as const, text: body }] }
}

/**
 * Tạo MCP server phơi tri thức framework AntAdmin (component C*, design token, docs,
 * package registry). Nhận Knowledge đã nạp sẵn — thuần đọc, không side effect.
 */
export function createServer(knowledge: Knowledge, version: string): McpServer {
  const server = new McpServer({ name: NAME, version })

  server.registerTool(
    'list_components',
    {
      title: 'Liệt kê component C*',
      description: 'Danh sách component thương hiệu AntAdmin (@antadmin/ui) kèm mô tả ngắn và số props.',
      inputSchema: {},
    },
    async () => text(knowledge.components.map(formatComponentSummary).join('\n')),
  )

  server.registerTool(
    'get_component',
    {
      title: 'Chi tiết component C*',
      description: 'Props (kiểu, mặc định, mô tả), emits và đường dẫn của một component. Dùng để code UI đúng API thay vì đoán.',
      inputSchema: { name: z.string().describe('Tên component, vd "CChat"') },
    },
    async ({ name }) => {
      const c = knowledge.components.find((x) => x.name.toLowerCase() === name.toLowerCase())
      if (!c) {
        const names = knowledge.components.map((x) => x.name).join(', ')
        return text(`Không tìm thấy "${name}". Component có sẵn: ${names}`)
      }
      return text(formatComponentDetail(c))
    },
  )

  server.registerTool(
    'list_tokens',
    {
      title: 'Design token AntAdmin',
      description: 'Biến CSS --antadmin-* (light/dark) từ @antadmin/theme. Style bám token, không hardcode màu.',
      inputSchema: { filter: z.string().optional().describe('Lọc theo tên chứa chuỗi con, vd "color-primary"') },
    },
    async ({ filter }) => text(formatTokens(knowledge.tokens, filter)),
  )

  server.registerTool(
    'search_docs',
    {
      title: 'Tra cứu docs framework',
      description: 'Tìm trong tài liệu framework + gotchas CLAUDE.md (SSR, IAM, registry, kiến trúc...) theo từ khoá.',
      inputSchema: {
        query: z.string().describe('Từ khoá, vd "đăng nhập IAM" hoặc "SSR antd"'),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ query, limit }) => {
      const hits = searchDocs(knowledge.docs, query, limit ?? 5)
      if (!hits.length) return text(`Không tìm thấy tài liệu khớp "${query}".`)
      return text(hits.map((h) => `## ${h.title} (${h.path})\n${h.excerpt}`).join('\n\n'))
    },
  )

  server.registerTool(
    'list_packages',
    {
      title: 'Package @antadmin/*',
      description: 'Liệt kê package framework + version + vai trò, để biết dùng package nào cho việc gì.',
      inputSchema: {},
    },
    async () => text(formatPackages(knowledge.packages)),
  )

  return server
}
