const moment = require('moment');

// Helpers
const Constant = require('../config/Constant');
const { dd, empty, getNum, getStr, getBool, timeSince, getDateFormat, isEqual, objMaker, formatNumber, relNumberDiffPer, cardNoFormat, generateQrcode, getFixedDecimal } = require('./helpers');
const Media = require('../infrastructure/Media/Media');
const Msg = require('../messages/api');
const Message = require('../config/Message');

//---------------------------------------------------------------------------------------------

// Config { ---------------------------------


// User { ---------------------------------
// Auth User Token
exports.authUserToken = (row) => {
    // dd(row)
    return {
        _id: row._id,
        id: row._id + '',
        // tokenType: row.tokenType || 'common',
    };
};


// user Profile
exports.userProfile = (row) => {
    const freezeDate = row?.freezeDate || null;
    const isFreezed = freezeDate ? moment(freezeDate).isBefore() : false;
    const message = freezeDate ? (isFreezed ? Msg.profile.freezed : `${Msg.profile.deactivating} on ${getDateFormat(freezeDate)}, ${Msg.profile.deactivatingMsg}`) : '';
    return {
        _id: row._id,
        name: getStr(row.name),
        username: getStr(row.username),
        email: getStr(row.email),
        phone: getStr(row.phone),
    };
};


const userProfileShort = (row = {}) => {
    return {
        _id: row._id || '',
        name: getStr(row.name),
        username: getStr(row.username),
        email: getStr(row.email),
        isActive: getBool(row.isActive),
        profileImage: Media.getUserImage(row.profileImage),
        createdAt: getDateFormat(row.createdAt),
    };
};
exports.userProfileShort = userProfileShort;
// } User ---------------------------------



// Support ticket { ---------------------------------
// Support ticket
const reply = (row, user) => {
    const attachments = row?.attachments || [];
    const replyBy = empty(row?.adminId) ? getStr(user?.name) : 'Legally Team';
    return {
        _id: row._id,
        replyBy,
        message: getStr(row?.message),
        attachments: objMaker(attachments || [], { '_id:_id': '', 'srcUrl:src': Media.getSupportAttachment }),
        replyAt: getDateFormat(row.createdAt, 'D MMM YY, h:mm:ss A'),
    };
};
exports.supportReplyDetails = reply;


exports.supportTicketDetails = (row) => {
    return {
        _id: row?._id ?? '',
        ticketId: getStr(row?.ticketId),
        isOpen: row?.isOpen,
        // requestType: Constant.ticketRequestType[row.requestType],
        reply: (row?.reply?.length ? row?.reply?.map(r => {
            return reply(r, row?.userId);
        }) : []),
        category: {
            id: row?.categoryId?._id ?? '',
            name: getStr(row?.categoryId?.name),
            label: getStr(row?.categoryId?.label),
        },
        subcategory: {
            id: row?.subCategoryId?._id ?? '',
            name: getStr(row?.subCategoryId?.name),
            label: getStr(row?.subCategoryId?.label),
        },
        acceptedBy: {
            id: row?.acceptedBy?._id ?? '',
            name: getStr(row?.acceptedBy?.name),
            email: getStr(row?.acceptedBy?.email),
            isActive: getBool(row?.acceptedBy?.isActive),
            isMaster: getBool(row?.acceptedBy?.isMaster),
            isAgent: getBool(row?.acceptedBy?.isAgent),

        },
        acceptedAt: getDateFormat(row?.acceptedAt, 'D MMM YY, h:mm:ss A'),
        createdAt: getDateFormat(row?.createdAt, 'D MMM YY, h:mm:ss A'),
    };
};
// } Support Ticket ---------------------------------


