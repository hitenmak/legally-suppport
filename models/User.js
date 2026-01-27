const Mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
const {getSetFixedDecimal} = require('./Structure/fixedDecimal');

const objId = Mongoose.Schema.Types.ObjectId;

const userSchema = new Mongoose.Schema(
    {
        name: {type: String, default: null},
        username: {type: String, unique: true, required: true},

        email: {type: String, unique: true, required: true},

        hash: {type: String, default: null},
        salt: {type: String, default: null},

        phone: {type: String, default: null},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
userSchema.plugin(paginate);

module.exports = Mongoose.model('User', userSchema);

userSchema.index({sponsorId: 1, createdAt: 1, lastActiveDate: 1, prevActiveDate: 1});
userSchema.index({sponsorId: 1});
