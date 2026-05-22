const express = require('express')
const router = express.Router()
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const Project = require('../models/Project')
const Document = require('../models/Document')
const auth = require('../middleware/auth')
const validateFile = require('../middleware/validateFile')
const storageService = require('../services/storageService')

const upload = multer({ storage: multer.memoryStorage() })

router.post('/projects/:id/documents', auth, upload.single('file'), validateFile, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const objectName = `${req.params.id}/${uuidv4()}.pdf`
    await storageService.upload(objectName, req.file.buffer, req.file.mimetype)

    const doc = await Document.create({
      projectId: project._id,
      title: req.body.title || req.file.originalname,
      documentType: req.body.documentType || 'other',
      format: 'application/pdf',
      datePublished: new Date().toISOString().split('T')[0],
      _objectName: objectName
    })

    doc.url = `/api/documents/${doc._id}/file`
    await doc.save()

    res.status(201).json(doc)
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid project ID' })
    res.status(500).json({ error: error.message })
  }
})

router.get('/documents/:id/file', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc || !doc._objectName) return res.status(404).json({ error: 'Document not found' })

    const stream = await storageService.getStream(doc._objectName)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${doc.title}.pdf"`)
    stream.pipe(res)
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid document ID' })
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
