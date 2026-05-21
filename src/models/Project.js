const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    ocid: {type:String, required:true, unique:true},
    title:{type:String, required:true},
    description:String,
    status:{type:String,enum:['identification', 'preparation', 'implementation', 'completion', 'maintenance', 'decommissioning', 'cancelled']},
    sector:String,
    province:String,
    budget:{amount:Number, currency:String},
    period:{startDate:String, endDate:String},
    parties:[{name:String, role:String}],
    isPublic:{type:Boolean, default:false}
}, {timestamps:true});

ProjectSchema.index({status:1});
ProjectSchema.index({sector:1});
ProjectSchema.index({province:1});
ProjectSchema.index({isPublic:1});

module.exports = mongoose.model('Project', ProjectSchema);