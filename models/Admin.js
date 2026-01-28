const Mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const { jsonStructure } = require('./Structure/jsonStructure');

const schema = new Mongoose.Schema({

        name: { type: String, default: null },
        email: { type: String, unique: true, required: true },
        hash: { type: String, default: null },
        salt: { type: String, default: null },
        isMaster: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        permission: jsonStructure,

    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt', deleteAt: 'deleteAt' } }
)

schema.plugin(paginate);

module.exports = Mongoose.model('Admin', schema);
