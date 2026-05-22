const minioClient = require('../config/minio')

const BUCKET = process.env.MINIO_BUCKET

const upload = (objectName, buffer, mimetype) => {
  return minioClient.putObject(BUCKET, objectName, buffer, buffer.length, { 'Content-Type': mimetype })
}

const getStream = (objectName) => {
  return minioClient.getObject(BUCKET, objectName)
}

module.exports = { upload, getStream }
