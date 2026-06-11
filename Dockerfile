FROM node:20-bookworm AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY shared/package.json shared/

RUN npm ci

COPY backend backend
COPY frontend frontend
COPY shared shared

ARG NEXT_PUBLIC_API_URL=https://origincarpets.com/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN cd backend && npx prisma generate
RUN rm -rf backend/dist frontend/.next backend/*.tsbuildinfo && \
    npm run build --workspace backend && npm run build --workspace frontend

FROM node:20-bookworm AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY shared/package.json shared/

RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist backend/dist
COPY --from=builder /app/backend/prisma backend/prisma
COPY --from=builder /app/backend/node_modules/.prisma backend/node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma backend/node_modules/@prisma
COPY --from=builder /app/frontend/.next frontend/.next
COPY --from=builder /app/frontend/public frontend/public

COPY scripts/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000 4000

ENTRYPOINT ["/entrypoint.sh"]
