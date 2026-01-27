const mongoose = require('mongoose');

exports = module.exports = {};

const getFixedDecimal = (value, fractionDigits = 8) => {
    const Decimal128 = mongoose.Types.Decimal128;
    if (value instanceof Decimal128) {
        value = value.toString();
    }
    if(typeof value === 'string' && /^\d+$/.test(value)) {
        value = Number(value);
    }
    // console.log(Number((value || 0).toFixed(fractionDigits)));
    return Number((value || 0).toFixed(fractionDigits));
};


exports.getSetFixedDecimal = {
    type: Number,
    default: 0,
    get: (data) => {
        try {
            // console.log('try');
            return getFixedDecimal(data);
            // console.log('try after');
        } catch (e) {
            // console.log(e);
            return data;
        }
    },
    set: (data) => {
        try {
            return getFixedDecimal(data);
        } catch (e) {
            return data;
        }
    },
};
