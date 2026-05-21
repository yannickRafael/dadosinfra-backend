# dadosinfra-backend

Backend for the Mozambique Infrastructure Disclosure Portal (dadosinfra.co.mz).
Rebuilt from Firebase/Google Cloud onto national on-premises infrastructure.

**Stack:** Node.js 18 · Express · MongoDB 6 (replica set) · MinIO · PM2 · Nginx

---

## Setup

_To be completed on Day 5._

---

## Environment Variables

_To be completed on Day 5._

---

## Running the Importer

```bash
npm run import
```

_Details to be completed on Day 5._

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

_To be completed on Day 4._

### Indexes

_To be completed on Day 2._

### Security floor

_To be completed on Day 4._

---

## Tests

_To be completed on Day 5._

---

## Deployment

_To be completed on Day 5._
