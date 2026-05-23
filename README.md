# dadosinfra-backend

Backend for the Mozambique Infrastructure Disclosure Portal (dadosinfra.co.mz).
Rebuilt from Firebase/Google Cloud onto national on-premises infrastructure.

**Stack:** Node.js 18 · Express · MongoDB 6 (replica set) · MinIO · PM2 · Nginx

---

## Setup

See [RESTORE.md](./RESTORE.md) for the full step-by-step restore guide.

Quick start:

```bash
git clone https://github.com/yannickRafael/dadosinfra-backend.git
cd dadosinfra-backend
cp .env.example .env   # fill in values
docker compose up -d
docker exec -it dadosinfra-db mongosh --eval "rs.initiate()"
npm install
npm run import
npm run seedUser
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `MONGODB_URI` | MongoDB connection string (must include `replicaSet=rs0&directConnection=true`) |
| `MINIO_ENDPOINT` | MinIO host (e.g. `localhost`) |
| `MINIO_PORT` | MinIO port (default `9000`) |
| `MINIO_USE_SSL` | `true` or `false` |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | Bucket name for document storage (e.g. `documents`) |
| `MINIO_ROOT_USER` | MinIO root user (used by Docker Compose) |
| `MINIO_ROOT_PASSWORD` | MinIO root password (used by Docker Compose) |
| `JWT_SECRET` | Secret for signing JWT tokens — use a long random string |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `8h`) |

---

## Interactive API Docs

Start the server and open:

```
http://localhost:3000/api/docs
```

Swagger UI — browse all endpoints, read descriptions, and test requests directly in the browser. Use the **Authorize** button to enter your JWT token for protected endpoints.

---

## API Reference

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Returns MongoDB + MinIO status |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | Returns JWT token |

Request body: `{ "email": "...", "password": "..." }`

### Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | None | List projects with filters + pagination |
| GET | `/api/projects/:id` | None | Single project with tenders, contracts, documents |
| POST | `/api/projects` | Bearer token | Create project |

Query params for `GET /api/projects`: `sector`, `province`, `status`, `isPublic`, `page`, `limit`

### Documents

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/projects/:id/documents` | Bearer token | Upload PDF document |
| GET | `/api/documents/:id/file` | None | Stream PDF file |

---

## Running the Importer

Loads `scripts/data.json` into MongoDB. Idempotent — safe to run multiple times.

```bash
npm run import
```

---

## Design Decisions

### Schema: Referenced documents

Used referenced documents (separate collections with `projectId` FK) instead of embedding
tenders, contracts, and documents inside the project document because:
- The project list endpoint must be fast and must not load nested data — embedding would
  force loading all nested arrays for every project in the list
- For previews and partial data views, only basic metadata is needed; referenced documents
  load on demand
- Embedded arrays have no size bound guarantee for long-lived projects that accumulate
  documents over years

### Authentication

JWT-based authentication. Login via `POST /api/auth/login` returns a signed token.
Protected routes require `Authorization: Bearer <token>` header.
Admin user is provisioned via `npm run seedUser` — no self-registration endpoint.

### Indexes

MongoDB indexes on `Project`: `ocid` (unique), `status`, `sector`, `province`, `isPublic`.
Indexes on `Tender`, `Contract`, `Document`: `projectId` (all queries filter by project).

### Security floor

- Rate limiting: 100 req/15min globally, 10 req/15min on login endpoint
- Magic byte validation: PDF uploads rejected if first 4 bytes are not `%PDF`
- Audit log: all mutating requests (POST/PUT/PATCH/DELETE) logged with timestamp, path, and user ID
- JWT verification on all write endpoints

---

## Tests

11 integration tests covering health, project listing, filtering, single project assembly,
auth (positive and negative), and protected route access.

```bash
npm test
```

---

## Deployment

See [nginx/dadosinfra.conf](./nginx/dadosinfra.conf) for the Nginx reverse proxy config.

Production start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
