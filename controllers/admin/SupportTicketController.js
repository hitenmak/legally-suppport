
// Models
const User = require('../../models/User');
const SupportTicket = require('../../models/SupportTicket');
const SupportTicketQuickReplay = require('../../models/SupportTicketQuickReplay');

// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const { getFullUrlAction } = require('../../helpers/ejsHelpers');
const Pager = require('../../infrastructure/Pager');
const Constant = require('../../config/Constant');
const Media = require('../../infrastructure/Media/Media');
const SubDocument = require('../../infrastructure/SubDocument');
const Msg = require('../../messages/admin');
const NotificationSend = require('../../infrastructure/Notification');
const { supportTicketReply } = require('../../infrastructure/Mail/Mail');
const path = require('path');

//---------------------------------------------------------------------------------------------


// Index View
exports.index = async (req, res) => {
    const ret = res.ret;

    const userId = req?.user?._id;

    ret.render('support-ticket/list', {
        requestType: Constant.ticketRequestType,
        viewData: { userId, isMasterAdmin: req?.isMasterAdmin, userPermission: req?.userPermission },
    });
};


// list
exports.list = async (req, res) => {
    const ret = res.ret;
    try {
        const reqData = req.body;
        let filters = {};

        // Page calculation {
        const Pgr = new Pager(reqData);
        if (Pgr.isValidData) return ret.sendFail(Pgr.isValidData);
        let isSortCreatedAt = reqData?.orderBy?.createdAt && (Object.keys(reqData?.orderBy).length == 1) && Object.keys(reqData?.orderBy)[0] == 'createdAt';
        let options = { page: reqData?.pageNumber || 1, limit: 10, populate: 'userId categoryId subCategoryId acceptedBy reply.adminId', sort: isSortCreatedAt ? { lastRepliedAt: 'desc', ...reqData?.orderBy } : reqData?.orderBy, lean: true, }
        // } Page calculation

        // Filters {
        if (!empty(Pgr.commonSearchFilters)) filters = { ...Pgr.commonSearchFilters };
        if (reqData?.filters?.userId) filters = { ...filters, userId: reqData?.filters?.userId };
        if (reqData?.filters?.isOpen) filters = { ...filters, isOpen: reqData.filters.isOpen };
        if (reqData?.filters?.isRead) filters = { ...filters, isRead: reqData.filters.isRead };
        if (reqData?.filters?.isRepliedByAdmin) filters = { ...filters, isRepliedByAdmin: reqData.filters.isRepliedByAdmin };
        if (reqData?.filters?.isForDeveloper) filters = { ...filters, isForDeveloper: reqData.filters.isForDeveloper };
        if (reqData?.filters?.requestType) filters = { ...filters, requestType: reqData.filters.requestType };
        if (reqData?.filters?.isDeleted) filters = { ...filters, isDeleted: getBool(reqData.filters.isDeleted) };
        if (!getBool(req?.query?.isMasterAdmin)) filters = { ...filters, $or: [{ acceptedBy: req?.query?.userId }, { acceptedBy: null }] };
        // d(filters, 'filters');
        // } Filters

        // Make Query {
        const pager = await SupportTicket.paginate(filters, options);

        // } Make Query

        let newRecords = [];
        if (!empty(pager.docs)) {
            (pager.docs || []).forEach((row, i) => {
                let user = row.userId || {};
                // dd(user);
                row.userReference = {
                    redirectUrl: getFullUrlAction('user/details/' + user._id),
                    label: user.name || '',
                };
                row.username = user.username || '';

                row.name = user.name;
                row.requestType = Constant.ticketRequestType[row.requestType];
                row.actionDetails = getFullUrlAction('support-ticket/details/' + row._id);
                row.actionDeleteDirect = row.isDeleted ? null : getFullUrlAction('support-ticket/delete/' + row._id);
                row.profileImage = Media.getAdminUserImage(user.profileImage);
                row.createdAt = timeSince(row.createdAt);
                row.isRepliedByAdmin = row.isRepliedByAdmin ? 'Yes' : 'No';
                row.ticketStatus = { _id: row._id, isDeleted: row?.isDeleted ? true : false };
                row.acceptedBy = row?.acceptedBy?.name;
                row.categoryId = row?.categoryId?.label;
                row.subCategoryId = row?.subCategoryId?.label;
                row.lastRepliedBy = row?.reply.findLast(r => r?.adminId !== null)?.adminId?.name
                // { id: row?.categoryId?._id, name: row?.categoryId?.name, label: row?.categoryId?.label };
                newRecords.push(row);
            });
        }

        const resData = { records: newRecords, pageNumber: pager.page, totalPages: pager.totalPages, totalRecords: pager.totalDocs, limit: pager.limit, }

        ret.sendSuccess(resData, 'Record found');
    } catch (e) { console.log(e); ret.err500(e); }
};


// Create
exports.create = async (req, res) => {
    Media.storeSupportAttachment('attachments')(req, res, async (err) => {
        // dd(req.files);
        req = formatReqFiles(req);
        const ret = res.ret;
        const reqData = req.body;
        const adminId = req.user._id;
        // Check validation
        const isInvalid = checkValidation(reqData, {
            requestType: `required|in:${Constant.ticketRequestTypeKeys.join(',')}`,
            message: 'required',
            userId: 'required | objectId',
        });

        if (isInvalid) return ret.sendFail(isInvalid);
        const record = new SupportTicket;
        record.userId = reqData.userId;
        record.requestType = getStr(reqData.requestType);
        const result = await SupportTicket.findOne({}, {}, { sort: { _id: -1 } }).exec();
        record.ticketId = result ? (parseInt(result.ticketId) + 1).toString().padStart(8, '0') : (1).toString().padStart(8, '0');
        record.reply.push({
            adminId,
            message: getStr(reqData.message),
            attachments: objMaker(req.files, { 'src:filename': getStr })
        });
        record.save().then(async updatedRecord => {
            if (empty(updatedRecord)) return ret.sendFail();
            updatedRecord.userId = req._user;

            ret.sendSuccess(getFullUrlAction(`support-ticket/details/${record._id}`), Msg.supportTicket.create);
        }).catch(e => ret.err500(e));
    });
};


// Details
exports.details = async (req, res) => {
    const ret = res.ret;
    try {
        const id = req.params.id;

        // Check validation {
        const isInvalid = checkValidation({ id }, {
            id: 'required | objectId',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        // } Check validation
        // SupportTicketQuickReplay.insertMany([
        //     {title: 'test', description: 'test'}
        // ]);
        const quickReplies = await SupportTicketQuickReplay.find({}).sort({ title: 1 }).exec() || [];
        // dd(quickReplies);
        const record = await SupportTicket.findById(id).populate('userId categoryId subCategoryId acceptedBy reply.adminId').exec();
        if (empty(record)) return ret.goBackError();

        const resData = { ...record._doc, quickReplies };
        resData.user = resData.userId;
        resData.userId = undefined;
        resData.user.profileImage = Media.getAdminUserImage(resData.user.profileImage);
        resData.createdAt = getDateFormat(resData.createdAt);
        resData.requestType = Constant.ticketRequestType[resData.requestType];
        resData.attachments = objMaker(resData.attachments, { 'src:src': Media.getSupportAttachment });
        const reply = resData.reply || [];
        reply.forEach((r, i) => {
            reply[i].replyAt = timeSince(r.createdAt);
            reply[i].dayAt = getDateFormat(r.createdAt, 'D MMM YY, h:mm:ss A');
            reply[i].userName = r.adminId?.name || resData.user?.name;
            reply[i].attachments = objMaker(r.attachments, { 'src:src': Media.getSupportAttachment });
        });
        resData.reply = reply;

        resData.userProfileDetails = getFullUrlAction('user/details/' + record.userId?._id);
        ret.render('support-ticket/details', resData);
    } catch (e) { console.log(e); ret.goBackError(e); }
};


// Replay Store
exports.replayStore = async (req, res) => {

    Media.storeSupportAttachment('attachments')(req, res, async (err) => {
        req = formatReqFiles(req);
        const ret = res.ret;
        let reqData = req.body;

        // Check validation {
        const isInvalid = checkValidation(reqData, {
            ticketId: 'required|objectId',
            message: 'required',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        // } Check validation
        const { ticketId, message } = reqData;
        const adminId = req.user._id;

        const record = await SupportTicket.findById(ticketId).exec();
        if (empty(record)) return ret.goBackError();
        const replySD = new SubDocument(record.reply);

        attachments = objMaker(req.files, { 'src:filename': getStr });
        replySD.new({ adminId, message, attachments });
        record.reply = replySD.closed();
        record.isRepliedByAdmin = true;

        record.save().then(async updatedRecord => {
            if (empty(updatedRecord)) return ret.goBackError();

            const user = await User.findById(updatedRecord.userId).lean();
            if (!empty(user)) NotificationSend.supportTicketReplay({ user, record: updatedRecord, });

            const userReplies = (record?.reply || []).filter(r => r.adminId != null);
            const sortedUserReplies = userReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestReply = sortedUserReplies[0];

            const outputDir = path.resolve(Constant.ROOT_DIR, `../${Constant.STORAGE.LOCAL_FOLDER}`);

            const attachments = [];

            if (latestReply?.attachments?.length) {
                for (const attachment of latestReply.attachments) {
                    attachments.push({
                        filename: attachment?.src || '',
                        path: attachment.src ? path.join(outputDir, 'support-attachment', attachment.src) : '',
                        contentType: 'application/pdf',
                    });
                }
            }

            await supportTicketReply({ toEmail: user.email, attachments, ticketId: record?.ticketId, requestType: record?.requestType, userName: req.user.name, email: req.user.email, message: latestReply?.message })

            ret.redirect(`support-ticket/details/${updatedRecord._id}`, 'Saved');

        }).catch(e => ret.goBackError());
    });

};


// Update Status
exports.updateStatus = async (req, res) => {

    const ret = res.ret;
    let reqData = req.body;
    try {

        // dd(reqData);
        // Check validation {
        const isInvalid = checkValidation(reqData, {
            ticketId: 'required|objectId',
            isOpen: 'required',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        // } Check validation

        const isOpen = !getBool(reqData.isOpen);
        const result = await SupportTicket.findByIdAndUpdate({ _id: reqData.ticketId }, { $set: { isOpen, isRead: true } }).exec();
        if (empty(result)) return ret.goBackError();
        ret.redirect(`support-ticket/details/${result._id}`, 'Saved');

    } catch (e) { ret.goBackError(e); }

};

// Update Status
exports.markRead = async (req, res) => {

    const ret = res.ret;
    let reqData = req.body;
    try {

        // dd(reqData);
        // Check validation {
        const isInvalid = checkValidation(reqData, {
            ticketId: 'required|objectId',
            isRead: 'required',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        // } Check validation

        const isRead = !getBool(reqData.isRead);
        const result = await SupportTicket.findByIdAndUpdate({ _id: reqData.ticketId }, { $set: { isRead } }).exec();
        if (empty(result)) return ret.goBackError();
        ret.redirect(`support-ticket/details/${result._id}`, 'Saved');

    } catch (e) { ret.goBackError(e); }

};


exports.delete = async (req, res) => {

    const ret = res.ret;
    let reqData = req.body;
    try {

        // Check validation {
        const isInvalid = checkValidation(req.params, {
            id: 'required|objectId',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        // } Check validation
        const id = req.params.id

        const result = await SupportTicket.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } }).exec();
        if (empty(result)) return ret.goBackError();
        ret.redirect(`support-tickets`, 'Deleted');

    } catch (e) { ret.goBackError(e); }

};


exports.deleteMultiple = async (req, res) => {

    const ret = res.ret;
    let reqData = req.body;
    try {

        // Check validation {
        const isInvalid = checkValidation(reqData, {
            deleteIds: 'required',
        });
        if (isInvalid) return ret.sendFail(isInvalid);
        // } Check validation

        // dd(reqData.deleteIds);
        const result = await SupportTicket.updateMany({ _id: { $in: reqData.deleteIds } }, { $set: { isDeleted: true } }).exec();
        // dd(result);
        if (empty(result)) return ret.sendFail();
        ret.sendSuccess({}, 'Deleted');

    } catch (e) { ret.err500(e); }

};


// mark for developer
exports.markForDeveloper = async (req, res) => {

    const ret = res.ret;
    let reqData = req.body;
    try {

        // dd(reqData);
        // Check validation {
        const isInvalid = checkValidation(reqData, {
            ticketId: 'required|objectId',
            isForDeveloper: 'required',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        // } Check validation

        const isForDeveloper = !getBool(reqData.isForDeveloper);
        const result = await SupportTicket.findByIdAndUpdate({ _id: reqData.ticketId }, { $set: { isForDeveloper } }).exec();
        if (empty(result)) return ret.goBackError();
        ret.redirect(`support-ticket/details/${result._id}`, 'Saved');

    } catch (e) { ret.goBackError(e); }

};



exports.accept = async (req, res) => {
    const ret = res?.ret;
    try {
        const { id } = req?.body;
        const isInvalid = checkValidation({ id }, {
            id: 'required | objectId',
        });
        if (isInvalid) return ret.goBackError(isInvalid);
        const isExist = await SupportTicket.findById(id).exec();
        if (!isExist) return ret.goBackError(Msg.supportTicket.notFound);
        else if (isExist?.acceptedBy && (getStr(isExist?.acceptedBy) === getStr(req?.user?._id))) return ret.sendFail(Msg.supportTicket.accept.alreadyAccepted);
        else if (isExist?.acceptedBy && (getStr(isExist?.acceptedBy) != getStr(req?.user?._id))) return ret.sendFail(Msg.supportTicket.accept.alreadyAcceptedByOther);
        const result = await SupportTicket.findByIdAndUpdate({ _id: id }, { $set: { acceptedBy: req?.user?._id, acceptedAt: Date.now() } }).exec();
        if (!result) return ret.goBackError(Msg.supportTicket.accept.fail);
        // ret.sendSuccess({}, Msg.supportTicket.accept.success);
        ret.redirectSuccess(`support-ticket/details/${result._id}`, 'Ticket Accepted');
    } catch (err) {
        ret.goBackError(e);
    }
}