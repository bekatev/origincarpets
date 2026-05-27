# Carpet Commerce Platform

Monorepo ecommerce scaffold for carpet sales with Next.js frontend and NestJS backend.

## Apps
- `frontend`: Next.js (App Router) storefront + admin UI shell
- `backend`: NestJS API with JWT auth and Prisma/PostgreSQL setup
- `shared`: shared TypeScript types/contracts

## Quick start
1. Install deps:
   ```bash
   npm install
   ```
2. Run backend:
   ```bash
   npm run dev:backend
   ```
3. Run frontend (new terminal):
   ```bash
   npm run dev:frontend
   ```

Frontend: http://localhost:3000
Backend: http://localhost:4000/api
