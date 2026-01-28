const { ShortCrypt } = require('short-crypt');

// Models
// const WithdrawRequest = require('../../models/WithdrawRequest');
const User = require('../../models/User');

// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, formatNumber, timeSince, getStr, getDateFormat, de } = require('../../helpers/helpers');
const { getFullUrlAction } = require('../../helpers/ejsHelpers');
const Constant = require('../../config/Constant');

const Pager = require('../../infrastructure/Pager');
const Msg = require('../../messages/admin');

//---------------------------------------------------------------------------------------------


// Index View
exports.downloadFile = async (req, res) => {
    const ret = res.ret;
    try {
        let fileKey = req?.params?.key;
        const cryptr = new ShortCrypt(Constant.cryptrSecret);
        fileKey =  new TextDecoder().decode(cryptr.decryptURLComponent(fileKey));

        dd(fileKey);
        return res.download(fileKey);

    } catch (e) {
        de(e);
        ret.redirectError('error/500');
    }
};
