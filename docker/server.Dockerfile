# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    PORT=5000

# tini reaps zombies and forwards SIGTERM, so graceful shutdown actually works.
RUN apk add --no-cache tini curl

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server/package.json ./package.json
COPY server/src ./src

# node:alpine ships an unprivileged `node` user; use it rather than root.
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
