
# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 pnpm 配置和依赖文件
COPY package.json pnpm-lock.yaml ./
# 安装 pnpm
RUN npm install -g pnpm@8.15.4
# 安装依赖（只安装生产依赖）
RUN pnpm install --frozen-lockfile --prod

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
# 安装所有依赖（包括开发依赖，用于构建）
RUN npm install -g pnpm@8.15.4
RUN pnpm install --frozen-lockfile

# 构建 Next.js 应用
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build


# 生产运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建 nextjs 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建输出
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

# 复制健康检查脚本
COPY healthcheck.js ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# 使用 Next.js standalone 输出启动服务器
CMD ["node", "server.js"]
