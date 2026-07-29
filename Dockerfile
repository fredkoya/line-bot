FROM node:24.18.0-bookworm-slim

RUN npm install -g pnpm@11.17.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["node", "src/index.ts"]
