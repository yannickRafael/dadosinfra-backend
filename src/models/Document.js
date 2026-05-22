const mongoose = require('mongoose');

const DocumentSchema = mongoose.Schema({
    projectId: {type:mongoose.Schema.Types.ObjectId, ref:'Project'},
    title: {type: String, required: true},
    documentType: String,
    format: {type: String, default: 'application/pdf'},
    url: String,
    datePublished: String,
    _objectName: String
}, {timestamps:true});

DocumentSchema.index({projectId:1});

module.exports = mongoose.model('Document', DocumentSchema);