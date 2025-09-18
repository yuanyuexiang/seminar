# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
# 检查并安装 libc6-compat（对于某些原生依赖可能需要）
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./
# 安装依赖（只安装生产依赖）
RUN npm ci --only=production --omit=dev

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm ci

# 生成 GraphQL 类型（如果需要）
# RUN npm run codegen

# 构建应用
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建 nextjs 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建输出
COPY --from=builder /app/public ./public

# 设置正确的权限和复制 .next 目录
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 自动利用输出跟踪来减少镜像大小
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制健康检查脚本
COPY --chown=nextjs:nodejs healthcheck.js ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# 使用 standalone 输出启动服务器
CMD ["node", "server.js"]
