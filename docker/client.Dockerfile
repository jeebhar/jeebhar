# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

# Defaults to a same-origin /api, which is what the bundled nginx proxies.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache curl

COPY docker/nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
