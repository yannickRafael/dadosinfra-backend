require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Project = require('../models/Project')

let validProjectId

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const project = await Project.findOne()
  validProjectId = project._id.toString()
})

afterAll(async () => {
  await Project.deleteOne({ ocid: 'ocds-abc123-MZ-JEST' })
  await mongoose.disconnect()
})

const makeToken = () => jwt.sign(
  { userId: new mongoose.Types.ObjectId(), role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

describe('GET /api/health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('GET /api/projects', () => {
  it('returns 200 with data array and pagination fields', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('pages')
  })

  it('filters by sector — all results match', async () => {
    const res = await request(app).get('/api/projects?sector=transport')
    expect(res.status).toBe(200)
    res.body.data.forEach(p => expect(p.sector).toBe('transport'))
  })
})

describe('GET /api/projects/:id', () => {
  it('returns assembled project with nested arrays', async () => {
    const res = await request(app).get(`/api/projects/${validProjectId}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('tenders')
    expect(res.body).toHaveProperty('contracts')
    expect(res.body).toHaveProperty('documents')
  })

  it('returns 400 for invalid ID format', async () => {
    const res = await request(app).get('/api/projects/invalid-id')
    expect(res.status).toBe(400)
  })

  it('returns 404 for nonexistent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app).get(`/api/projects/${fakeId}`)
    expect(res.status).toBe(404)
  })
})

describe('POST /api/auth/login', () => {
  it('returns token with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dadosinfra.mz', password: 'Admin1234!' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dadosinfra.mz', password: 'wrongpassword' })
    expect(res.status).toBe(401)
  })

  it('returns 400 with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dadosinfra.mz' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/projects', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ ocid: 'ocds-abc123-MZ-JEST', title: 'Jest Test' })
    expect(res.status).toBe(401)
  })

  it('returns 201 with valid token', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ocid: 'ocds-abc123-MZ-JEST', title: 'Jest Test' })
    expect(res.status).toBe(201)
    expect(res.body.ocid).toBe('ocds-abc123-MZ-JEST')
  })
})
