const Mongoose = require('mongoose');


const schema = new Mongoose.Schema({
    title: { type: String, require: true },
    description: { type: String, require: true },

},
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt', deleteAt: 'deleteAt' } }
);

const SupportTicket = Mongoose.model('SupportTicketQuickReplay', schema);

SupportTicket.createIndexes({ ticketId: 1 });
module.exports = SupportTicket;


/*
db.supportticketquickreplays.insertMany([
    {title:'Issue resolve' ,description: 'Your issue has been resolved. Please let us know if you have further query regarding it.'},
    {title:'Withdrawal address change or delete' ,description: 'We are not able to perform this action.'},
])*/

// After a complete stake. coin is removed from your wallet.
