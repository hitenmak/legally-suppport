const Mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const objId = Mongoose.Schema.Types.ObjectId;
const { mediaAttachmentStructure } = require('./Structure/mediaAttachmentStructure');
const Constant = require('../config/Constant');


const replySchema = new Mongoose.Schema({
    adminId: { type: objId, ref: 'Admin', default: null },
    message: { type: String, default: null },
    attachments: [mediaAttachmentStructure],
}, { timestamps: { createdAt: 'createdAt' } });

const questionSchema = new Mongoose.Schema({
    question: { type: String, default: null },
    type: { type: String, enum: Constant.questionTypes, default: 'text' },
    answer: { type: Mongoose.Schema.Types.Mixed, default: null },
});

const SupportTicketSchema = new Mongoose.Schema({
    ticketId: { type: String, require: true },
    userId: { type: objId, ref: 'User', default: null },
    // requestType: { type: String, enum: Constant.ticketRequestTypeKeys, default: 'other' },
    categoryId: { type: objId, ref: 'Category', default: null },
    subCategoryId: { type: objId, ref: 'SubCategory', default: null },
    questions: [questionSchema],
    isOpen: { type: Boolean, default: true },
    isRead: { type: Boolean, default: false },
    isForDeveloper: { type: Boolean, default: false },
    isRepliedByAdmin: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    reply: [replySchema],
    lastRepliedAt: { type: Date, default: new Date() },
    acceptedBy: { type: objId, ref: 'Admin', default: null },
    acceptedAt: { type: Date, default: null },
},
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt', deleteAt: 'deleteAt' } }
);

SupportTicketSchema.plugin(paginate);

const SupportTicket = Mongoose.model('SupportTicket', SupportTicketSchema);

SupportTicket.createIndexes({ ticketId: 1 });
module.exports = SupportTicket;
