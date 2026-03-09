# STAGE 1: Build Angular SSR
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build  # builds browser + server (SSR)

# STAGE 2: Run Angular SSR
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist/examen-frontend /app/dist

RUN apk add --no-cache curl

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl -f http://localhost:4000/ || exit 1
CMD ["node", "dist/server/server.mjs"]
