# API Forge — Advanced API Testing Platform

A MERN-stack starter for an advanced Postman-style API development, testing and security platform.

## Structure

- `frontend/` — React + Vite + Tailwind UI
- `backen/` — Express + MongoDB API (folder name kept as requested)

## Included

- API workspaces and collections
- HTTP request builder (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS)
- Query params, headers, JSON/raw body
- Bearer, Basic and API-key authentication
- Environments and `{{variable}}` substitution
- Request history
- JavaScript-style assertion definitions (safe built-in assertion DSL)
- API workflow execution
- Safe passive security scanner
- OpenAPI import endpoint
- API health endpoint
- MongoDB persistence
- Responsive dark developer UI

## Run

1. Install Node.js 20+ and MongoDB.
2. From this directory:

```bash
npm install
npm run install:all
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

Create `backen/.env` from `.env.example`.

## Security scanner

The included scanner is intentionally non-destructive/passive. It checks response headers, CORS, information leakage, cookie flags, HTTPS, and common configuration indicators. It does not perform exploit payloads or unauthorized active attacks.
