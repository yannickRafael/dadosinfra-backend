# Hours Log

## Part 1 — 2026-05-21
**Foundation**
- Created Docker Compose with MongoDB 6 replica set and MinIO
- Initialized replica set (`rs.initiate()`)
- Created MinIO `documents` bucket
- Set up Node.js project structure, installed dependencies
- Implemented `src/config/db.js` (Mongoose connection) and `src/config/minio.js`
- Implemented `GET /api/health` endpoint checking both MongoDB and MinIO
- Debugged `ECONNREFUSED` — fixed with `directConnection=true` in MongoDB URI

## Part 2 — 2026-05-21 (~2h)
**Schemas, Seed, Importer**
- Decided on referenced document schema over embedded (performance + no size limit)
- Implemented Mongoose schemas for `Project`, `Tender`, `Contract`, `Document`
- Added indexes: unique `ocid`, filters on `status`, `sector`, `province`, `isPublic`
- Wrote `scripts/seed.js` — generates 50 projects with realistic Mozambican data
- Wrote `scripts/import.js` — idempotent importer using `findOneAndUpdate` with `upsert`
- Verified idempotency: ran importer 3 times, always 50 projects in DB

## Part 3 — 2026-05-22 (~1.5h)
**API Routes**
- `GET /api/projects` with filters (sector, province, status, isPublic) and pagination
- `GET /api/projects/:id` assembling project + tenders + contracts + documents via `Promise.all`
- `POST /api/projects` with body validation and duplicate `ocid` handling (409)
- Fixed `CastError` → 400 for invalid MongoDB ObjectId format

## Part 4 — 2026-05-22 (~2h)
**Auth, File Upload, Security**
- `src/models/User.js` schema with email, passwordHash, role
- `scripts/seedUser.js` — provisions admin user with bcrypt-hashed password
- `POST /api/auth/login` — bcrypt compare, JWT sign, return token
- `src/middleware/auth.js` — Bearer token verification, attaches `req.user`
- `POST /api/projects` protected with auth middleware
- `src/services/storageService.js` — MinIO `putObject` and `getObject` wrappers
- `src/middleware/validateFile.js` — magic byte check (`%PDF`)
- `POST /api/projects/:id/documents` — upload PDF to MinIO, create Document record
- `GET /api/documents/:id/file` — stream file from MinIO to client
- Rate limiting: 100 req/15min global, 10 req/15min on login
- Audit log: mutating requests logged with timestamp and user ID

## Part 5 — 2026-05-23 (~1.5h)
**Tests, Deployment Config, Documentation**
- Refactored `src/app.js` (Express setup) separate from `src/index.js` (server start)
- 11 integration tests with Jest + Supertest — all passing
- `ecosystem.config.js` for PM2 production deployment
- `nginx/dadosinfra.conf` — reverse proxy config
- `RESTORE.md` — full restore guide from zero
- Completed `README.md` — setup, env vars, API reference, design decisions
- Swagger UI at `GET /api/docs` — interactive API documentation with endpoint descriptions

---

**Total: ~9.5 hours over 5 Parts**
