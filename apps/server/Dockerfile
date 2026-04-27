FROM node:18-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/server ./apps/server
COPY packages/shared ./packages/shared

WORKDIR /app/apps/server

RUN pnpm prisma generate
RUN pnpm build

EXPOSE 5000

CMD ["node", "dist/index.js"]