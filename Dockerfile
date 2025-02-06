# Stage 1: Builder
FROM node:20.9.0-alpine AS builder

WORKDIR /usr/app

# 🔥 Pastikan PNPM diaktifkan di container
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json & pnpm-lock.yaml untuk instalasi dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy semua source code (termasuk tsconfig.json & Prisma schema)
COPY . .

# 🔥 Generate Prisma Client sebelum build
RUN pnpm prisma generate

# 🔥 Build aplikasi (compile TypeScript ke JavaScript)
RUN pnpm build

# Stage 2: Runner
FROM node:20.9.0-alpine AS runner

WORKDIR /usr/app

# 🔥 Pastikan PNPM diaktifkan lagi di stage runner
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json & pnpm-lock.yaml
COPY --from=builder /usr/app/package.json /usr/app/pnpm-lock.yaml ./

# Copy folder dist hasil build
COPY --from=builder /usr/app/dist /usr/app/dist

# Copy node_modules dari builder
COPY --from=builder /usr/app/node_modules /usr/app/node_modules

# Copy Prisma Client (jika menggunakan Prisma)
COPY --from=builder /usr/app/prisma /usr/app/prisma

# Menjalankan aplikasi dalam mode produksi
#CMD ["node", "dist/main.js"]
CMD ["pnpm", "start:prod"]
