
# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 安装系统依赖
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./
# 安装生产依赖（忽略锁文件版本冲突）
RUN pnpm install --prod --ignore-pnpmfile --shamefully-hoist

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖文件并安装所有依赖（包括开发依赖）
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --ignore-pnpmfile --shamefully-hoist

# 复制源代码
COPY . .

# 设置环境变量并构建
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm run build


# 生产运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建系统用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public

# 复制 Next.js standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制健康检查脚本
COPY --chown=nextjs:nodejs healthcheck.js ./

# 切换到非特权用户
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# 启动应用
CMD ["node", "server.js"]
