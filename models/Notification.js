const Mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const objId = Mongoose.Schema.Types.ObjectId;
const { mediaAttachmentStructure } = require('./Structure/mediaAttachmentStructure');
const Constant = require('../config/Constant');
const { time } = require('speakeasy');

const NotificationSchema =new Mongoose.Schema({
	receiverId: { type: Mongoose.Schema.Types.ObjectId, refPath: 'receiverType', default: null },
	receiverType: { type: String, enum: Constant.RecieverType, default: 'member' },
	actionUserId: { type: Mongoose.Schema.Types.ObjectId, refPath: 'actionUserType', default: null },
	actionUserType: { type: String, enum: Constant?.ActionUserType, default: 'member' },
	moduleId: { type: Mongoose.Schema.Types.ObjectId, refPath: 'moduleType', default: null },
	moduleType: { type: String, default: null },
	message: { type: String, default: null },
	isRead: { type: Boolean, default: false },
}, {
	timestamps: true
});

NotificationSchema.plugin(paginate);

const Notification = Mongoose.model('Notification', NotificationSchema);
module.exports = Notification;