const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const minioClient = require('../config/minio')


router.get('/health', async (req, res) => {
  // Check MongoDB
  const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down'

  // Check MinIO
  let storageStatus = 'up'
  try {
    await minioClient.listBuckets()
  } catch (error) {
    storageStatus = 'down'
  }

  // Determine overall status
  const overallStatus = mongoStatus === 'up' && storageStatus === 'up' ? 'ok' : 'degraded'

  res.status(overallStatus === 'ok' ? 200 : 503).json({
    status: overallStatus,
    mongo: mongoStatus,
    storage: storageStatus,
    uptime: Math.floor(process.uptime())
  })
})

module.exports = router