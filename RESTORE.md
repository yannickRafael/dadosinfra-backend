# Restore Guide

Complete steps to get the app running from zero.

## Prerequisites

- Docker + Docker Compose
- Node.js 18+
- Git

---

## 1. Get the source code

**Option A — from the zip file (recommended):**
```bash
unzip "Backend - Yannick Rafael.zip"
cd dadosinfra-backend
```

**Option B — from GitHub:**
```bash
git clone https://github.com/yannickRafael/dadosinfra-backend.git
cd dadosinfra-backend
```

---

## 2. Create `.env`

Create a `.env` file in the project root with the following variables:

```env
PORT=3000

MONGODB_URI=mongodb://localhost:27017/dadosinfra?replicaSet=rs0&directConnection=true

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=<your-minio-access-key>
MINIO_SECRET_KEY=<your-minio-secret-key>
MINIO_BUCKET=documents

MINIO_ROOT_USER=<your-minio-access-key>
MINIO_ROOT_PASSWORD=<your-minio-secret-key>

JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=8h
```

---

## 3. Start Docker containers

```bash
docker compose up -d
```

Verify both containers are running:

```bash
docker compose ps
```

---

## 4. Initialize MongoDB replica set

Run once only. Skip if already initialized.

```bash
docker exec -it dadosinfra-db mongosh --eval "rs.initiate()"
```

---

## 5. Create MinIO bucket

Open the MinIO console at `http://localhost:9001`, log in with your credentials, and create a bucket named `documents`.

---

## 6. Install dependencies

```bash
npm install
```

---

## 7. Import seed data

```bash
npm run import
```

Verify:

```bash
docker exec -it dadosinfra-db mongosh dadosinfra --eval "db.projects.countDocuments()"
```

Expected: `50`

---

## 8. Seed admin user

```bash
npm run seedUser
```

Admin credentials:
- Email: `admin@dadosinfra.mz`
- Password: `Admin1234!`

---

## 9. Start the app

Development:
```bash
npm run dev
```

Production (requires PM2 installed globally):
```bash
pm2 start ecosystem.config.js
```

---

## 10. Verify

```bash
curl http://localhost:3000/api/health
```

Expected:
```json
{ "status": "ok", "mongo": "up", "storage": "up", "uptime": ... }
```

---

## 11. Run tests

```bash
npm test
```

Expected: 11 tests passing.
