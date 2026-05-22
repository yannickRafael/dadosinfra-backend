const express = require('express')
const router = express.Router()
const Project = require('../models/Project')
const Document = require('../models/Document')
const Tender = require('../models/Tender')
const Contract = require('../models/Contract')
const auth = require('../middleware/auth')

router.get('/projects', async(req, res) => {
    try{
        const filter = {}
        if (req.query.sector) filter.sector = req.query.sector
        if (req.query.province) filter.province = req.query.province
        if (req.query.status) filter.status = req.query.status
        if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true'

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const projects = await Project.find(filter).skip(skip).limit(limit)
        const total = await Project.countDocuments(filter)
        const pages = Math.ceil(total / limit)

        res.json({ data: projects, total, page, limit, pages })
    } catch (error) {
        res.status(500).json({ error: error.message })

    }
});

router.get('/projects/:id', async(req, res) => {
    try{
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const [tenders, contracts, documents] = await Promise.all([
            Tender.find({ projectId: project._id }),
            Contract.find({ projectId: project._id }),
            Document.find({ projectId: project._id })
        ]);

        res.json({...project.toObject(), tenders, contracts, documents })
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid project ID' })
        res.status(500).json({ error: error.message })
    }
});


router.post('/projects', auth, async (req, res) => {
  try {
    if (!req.body.ocid || !req.body.title) {
      return res.status(400).json({ error: 'ocid and title are required' })
    }

    const project = await Project.create(req.body)
    res.status(201).json(project)
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'ocid already exists' })
    res.status(500).json({ error: error.message })
  }
})


module.exports = router