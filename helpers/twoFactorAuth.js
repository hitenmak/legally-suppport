require('dotenv').config();

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { ShortCrypt } = require('short-crypt');

const qr = require('qr-image-color');

const { empty, dd, de } = require('./helpers');

// Helpers
const Constant = require('../config/Constant');


//---------------------------------------------------------------------------------------------
// const Encryptor = encryptor.encrypt(Constant.cryptrSecret)

// Generate Secrete
const generateSecrete = () => {
    return speakeasy.generateSecret({ name: process.env.APP_NAME });
};
exports.generateSecrete = generateSecrete;


// Verify Secrete
const verifySecrete = (token, secret) => {
    if (empty(token) || empty(secret) || empty(secret.ascii)) return false;
    try {
        return speakeasy.totp.verify({
            secret: secret.ascii,
            encoding: 'ascii',
            token: token
        });
    } catch (e) {
        de(e);
        return false;
    }
};
exports.verifySecrete = verifySecrete;


// Generate Qrcode Url
const generateQrcodeUrl = (secret) => {
    return new Promise((resolve, reject) => {
        try {
            let qrBuffer = qr.imageSync(secret.otpauth_url, { type: 'png', size: 11, color: Constant.colorCode.yellow, transparent: true });
            if (empty(secret)) resolve(null);
            let qrBase64Str = new Buffer.from(qrBuffer, 'base64').toString('base64');
            resolve(qrBase64Str);
            /*qrcode.toDataURL(secret.otpauth_url, (err, data) => { // base64 image
                if (!empty(err)) resolve(null);
                resolve(data);
            });*/
        } catch (e) {
            de(e);
            return null;
        }
    });
};
exports.generateQrcodeUrl = generateQrcodeUrl;


// Generate Qrcode Str
const generateQrcodeStr = (secret) => {
    return new Promise((resolve, reject) => {
        if (empty(secret)) resolve(null);
        try {
            qrcode.toString(secret.otpauth_url, (err, data) => {
                if (!empty(err)) resolve(null);
                resolve(data);
            });
        } catch (e) {
            de(e);
            return null;
        }
    });
};
exports.generateQrcodeStr = generateQrcodeStr;


// Encrypt
const encrypt = (data, secrete = null) => {
    if (empty(data)) return null;
    try {
        const cryptr = new ShortCrypt(secrete || Constant.cryptrSecret);
        return cryptr.encryptToURLComponent(data);
    } catch (e) {
        de(e);
        return null;
    }
};
exports.encrypt = encrypt;


// Decrypt
const decrypt = (data, secrete = null) => {
    if (empty(data)) return null;
    try {
        const cryptr = new ShortCrypt(secrete || Constant.cryptrSecret);
        return new TextDecoder().decode(cryptr.decryptURLComponent(data));
    } catch (e) {
        de(e);
        return null;
    }
};
exports.decrypt = decrypt;


