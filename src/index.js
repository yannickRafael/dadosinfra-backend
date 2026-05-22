require('dotenv').config()

const express = require('express')
const connectDB = require('./config/db')
const { generalLimiter } = require('./middleware/rateLimiter')
const auditLog = require('./middleware/auditLog')

const app = express()

app.use(express.json())
app.use(generalLimiter)
app.use(auditLog)

app.use('/api', require('./routes/health'))
app.use('/api', require('./routes/auth'))
app.use('/api', require('./routes/projects'))
app.use('/api', require('./routes/documents'))


const start = async () => {
  await connectDB()
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start()