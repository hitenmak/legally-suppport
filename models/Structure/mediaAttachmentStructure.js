const Mongoose = require('mongoose');

exports = module.exports = {};

exports.mediaAttachmentStructure = Mongoose.Schema({
    src: { type: String, default: null },
});