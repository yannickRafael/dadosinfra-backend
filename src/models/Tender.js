const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
    projectId: {type: mongoose.Schema.Types.ObjectId, required:true, ref:'Project'},
    title:{type: String, required: true},
    status: {type: String, enum:['planned', 'active', 'complete', 'cancelled']},
    procurementMethod:{type: String, enum:['open', 'limited', 'selective', 'direct']},
    value: {amount: Number, currency: String},
    tenderPeriod: {startDate: String, endDate:String}
}, {timestamps:true});

TenderSchema.index({projectId:1});

module.exports = mongoose.model('Tender', TenderSchema);