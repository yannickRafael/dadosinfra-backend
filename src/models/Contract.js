const mongoose = require('mongoose')

const ContractSchema = mongoose.Schema({
    projectId:{type:mongoose.Schema.Types.ObjectId, ref:'Project'},
    tenderId:{type:mongoose.Schema.Types.ObjectId, ref:'Tender'},
    title: {type:String, required: true},
    status: {type:String, enum:['pending', 'active', 'terminated', 'cancelled']},
    supplier: String,
    value:{amount: Number, currency:String},
    dateSigned: String,
    period:{startDate: String, endDate: String}
}, {timestamps: true});

ContractSchema.index({projectId:1});

module.exports = mongoose.model('Contract', ContractSchema);