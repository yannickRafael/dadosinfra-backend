const dotenv = require('dotenv');
const connectDB = require('../src/config/db')
const Project = require('../src/models/Project');
const Contract = require('../src/models/Contract');
const Tender = require('../src/models/Tender');
const Document = require('../src/models/Document');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') })

const run = async () => {
    await connectDB()

    const filePath = path.join(__dirname, 'data.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    for (const project of data) {
        const { tenders, contracts, documents, ...projectData } = project

        // upsert project
        const saved = await Project.findOneAndUpdate(
        { ocid: projectData.ocid },
        { $set: projectData },
        { upsert: true, returnDocument: 'after' }
        )

        // delete existing children then reinsert
        await Tender.deleteMany({ projectId: saved._id })
        await Contract.deleteMany({ projectId: saved._id })
        await Document.deleteMany({ projectId: saved._id })

        if (tenders.length)   await Tender.insertMany(tenders.map(t => ({ ...t, projectId: saved._id })))
        if (contracts.length) await Contract.insertMany(contracts.map(c => ({ ...c, projectId: saved._id })))
        if (documents.length) await Document.insertMany(documents.map(d => ({ ...d, projectId: saved._id })))
    }

    console.log(`Imported ${data.length} projects`)
    process.exit(0)
    }

run()