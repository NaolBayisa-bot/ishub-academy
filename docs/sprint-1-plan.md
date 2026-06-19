# Sprint 1 Plan — IS Hub Academy

## Goal
Validate full architecture: Landing → Register → Pending Approval → Admin Approve → Student Dashboard

## Implementation Steps
1. ✅ Project scaffolding & monorepo setup
2. DB schema + migration (User, Category + enums)
3. Auth: Register endpoint
4. Auth: Login endpoint
5. Categories: GET endpoint
6. Users: Admin endpoints (list, approve/reject)
7. Frontend: API layer + AuthContext
8. Frontend: Shared UI components
9. Frontend: Landing Page
10. Frontend: Register Page
11. Frontend: Login Page
12. Frontend: Pending Approval Page
13. Frontend: Admin Dashboard
14. Frontend: Student Dashboard
15. End-to-end integration testing

## Tech Decisions
- PostgreSQL 16 via Docker for dev
- Prisma ORM with migrations
- NestJS modular architecture (auth, users, categories)
- React + TypeScript + Tailwind CSS + Vite
- JWT auth (Google OAuth strategy wired, UI deferred)
- npm workspaces for monorepo management
