FROM node:24.18.0-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["node", "src/index.ts"]
