require('dotenv').config();
// const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Helpers
const { dd } = require('../helpers/helpers');
const Constant = require('../config/Constant');


//---------------------------------------------------------------------------------------------

const insertAtIndex = (str, substring, index) => {
    return str.slice(0, index) + substring + str.slice(index);
};

const insertRandomChar = (str, substring = '-', length) => {
    while (length !== 0) {
        let i = (Math.floor(Math.random() * str.length) + 1);
        if (i === 0 || i === str.length) continue;
        if (str[i - 1] === undefined || str[i - 1] === '-' || str[i + 1] === undefined || str[i + 1] === '-' || str[i] === '-') continue;

        str = insertAtIndex(str, substring, i);
        length -= 1;
    }
    return str;
};


// Generate Token
const generateToken = (id = '', length = null) => {
    length = length || Constant.refreshTokenLength;
    id = id.toString();
    let a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
    let rawToken = '';
    let totalDash = 6;
    let timeToken = (Date.now()).toString();
    // timeToken = insertAtIndex(timeToken, '-',(Math.random() * (timeToken.length - 1)).toFixed(0));

    let newLength = (length - (timeToken.length + id.length)) - totalDash;
    for (let i = 0; i < newLength; i++) {
        let j = (Math.random() * (a.length - 1)).toFixed(0);
        rawToken += a[j];
    }

    rawToken = insertRandomChar(rawToken, timeToken, 1);
    rawToken = insertRandomChar(rawToken, id, 1);
    rawToken = insertRandomChar(rawToken, '-', totalDash);
    return rawToken;
};
exports.generateToken = generateToken;


// Generate In Range
const generateInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.generateInRange = generateInRange;


// Generate OTP
exports.generateOTP = (n = 6) => {
    // return generateInRange(1000, 9999);
    return generateInRange(100000, 999999);
};

// Generate Salt
const generateSalt = () => {
    return crypto.randomBytes(Math.ceil(10)).toString('hex').slice(0.16);
};

// Sha512
const sha512 = (password, salt) => {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    hash = hash.digest('hex');
    return hash;
};

// Make Hash Password
exports.makeHashPassword = (password) => {
    const salt = generateSalt();
    const hash = sha512(password, salt);
    return { hash: hash, salt: salt };
};


// Match Hash Password
exports.matchHashPassword = (password, hash, salt) => {
    hashNew = sha512(password, salt);
    return hashNew === hash;
};


// Generate Jwt Token
exports.generateJwtToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRATION });
};

// Generate Jwt Refresh Token
exports.generateJwtRefreshToken = (payload) => {
    return jwt.sign({ refreshToken: payload }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
};
