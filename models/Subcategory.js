const Mongoose = require('mongoose');
const paginate = require("mongoose-paginate-v2");

const schema = new Mongoose.Schema({
	name: { type: String, required: true },
	label: { type: String, required: true },
	categoryId: { type: Mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
},
	{ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt', deleteAt: 'deleteAt' } }
);

schema.plugin(paginate);

module.exports = Mongoose.model('SubCategory', schema);