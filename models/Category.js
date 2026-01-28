const Mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const { jsonStructure } = require('./Structure/jsonStructure');

const schema = new Mongoose.Schema({
	name: { type: String, required: true },
	label: { type: String, required: true },
},
	{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt', deleteAt: 'deleteAt' } }
);

schema.plugin(paginate);

module.exports = Mongoose.model('Category', schema);