const express = require('express')
const router = express.Router()
const Project = require('../models/Project')

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

module.exports = router