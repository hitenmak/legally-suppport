// Models
const SupportTicket = require('../../models/SupportTicket');
const User = require('../../models/User');

const { empty, checkValidation, getStr, getVal, objMaker, formatReqFiles, filterUsername, dd } = require('../../helpers/helpers');
const { makeHashPassword } = require('../../helpers/auth');
const MakeData = require('../../helpers/makeData');
const Msg = require('../../messages/api');

const Media = require('../../infrastructure/Media/Media');

const Constant = require('../../config/Constant');
const { supportTicketCreate, supportTicketReply } = require('../../infrastructure/Mail/Mail');
const path = require('path');
const Admin = require('../../models/Admin');
const Notification = require('../../models/Notification');


//---------------------------------------------------------------------------------------------

// Create
exports.create = async (req, res) => {
    Media.storeSupportAttachment('attachments')(req, res, async (err) => {
        // dd(req.files);
        req = formatReqFiles(req);
        const ret = res.ret;
        const reqData = req.body;
        // Check validation
        const isInvalid = checkValidation(reqData, {
            requestType: `required|in:${Constant.ticketRequestTypeKeys.join(',')}`,
            message: 'required',
        });
        if (isInvalid) return ret.sendFail(isInvalid);
        const record = new SupportTicket;
        record.userId = req.uid;
        record.requestType = getStr(reqData.requestType);
        const result = await SupportTicket.findOne({}, {}, { sort: { _id: -1 } }).exec();
        record.ticketId = result ? (parseInt(result.ticketId) + 1).toString().padStart(8, '0') : (1).toString().padStart(8, '0');
        record.reply.push({
            message: getStr(reqData.message),
            attachments: objMaker(req.files, { 'src:filename': getStr })
        });
        record.save().then(async updatedRecord => {
            if (empty(updatedRecord)) return ret.sendFail();
            updatedRecord.userId = req._user;
            let resData = MakeData.supportTicketDetails(updatedRecord);

            const userReplies = (record?.reply || []).filter(r => r.adminId === null);
            const sortedUserReplies = userReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestReply = sortedUserReplies[0];

            const outputDir = path.resolve(Constant.ROOT_DIR, `../${Constant.STORAGE.LOCAL_FOLDER}`);

            const attachments = [];

            if (latestReply?.attachments?.length) {
                for (const attachment of Object.values(latestReply?.attachments)) {
                    for (const a of attachment) {
                        attachments.push({
                            filename: a?.src || '',
                            path: a.src ? path.join(outputDir, 'support-attachment', attachment.src) : '',
                            contentType: 'application/pdf',
                        });
                    }
                }
            }

            const admins = await Admin.find({ isMaster: true });
            const adminMails = admins.map(a => a?.email);
            await supportTicketCreate({ toEmail: adminMails, attachments, ticketId: record?.ticketId, requestType: record?.requestType, userName: req.user.name, email: req.user.email, message: latestReply?.message })
            ret.sendSuccess(resData, Msg.supportTicket.create);
        }).catch(e => ret.err500(e));
    });
};

// Create
exports.createticket = async (req, res) => {
    Media.storeSupportAttachment('attachments')(req, res, async () => {
        // ,Screenshot of payment (optional but recommended),Upload photo/video evidence,Screenshot (if applicable),Screenshot of error message,Upload photo evidence (mandatory),Screenshot of tracking screen,Photo evidence (if any),Screenshot or screen recording,Upload evidence (if fraud)
        // dd(req.files);
        req = formatReqFiles(req);
        const ret = res.ret;
        const reqData = req.body;
        // Check validation
        const isInvalid = checkValidation(reqData, {
            // requestType: `required|in:${Constant.ticketRequestTypeKeys.join(',')}`,
            message: 'required',
            categoryId: 'required|objectId',
            subCategoryId: 'required|objectId',
            slug: `required|in: ${Constant?.questionKeys}`,
        });
        if (isInvalid) return ret.sendFail(isInvalid);
        /*
                const questionForFile = Constant.questions[reqData?.slug].filter((q) => {
                    return q?.type === 'FILE';
                });
                reqData.questions = JSON.parse(reqData?.questions) || [];
                if (questionForFile?.length) {
        
                    questionForFile?.reduce((acc, q) => { acc.push({ question: q?.label, type: "FILE", answer: req?.files[q?.label]?.map((f) => f?.filename) }); return acc; }, reqData?.questions);
                }
        
                const isInvalidQuestions = checkValidation(reqData?.questions, {
                    question: 'required|string',
                    type: `required|string|in:${Constant?.questionTypes}`,
                    // answer: 'required',
                });
        
                if (isInvalid) return ret.sendFail(isInvalidQuestions);
                */
        const record = new SupportTicket;
        const isExistEmail = await User.findOne({ email: filterUsername(reqData?.email) }).exec();

        if (empty(isExistEmail)) {
            const { hash, salt } = makeHashPassword("12345678");
            let newRecord = {
                name: getVal(reqData?.name),
                username: getVal(filterUsername(reqData?.email)),
                email: getVal(filterUsername(reqData?.email)),
                phone: getVal(reqData?.phone),
            }

            newRecord.hash = hash;
            newRecord.salt = salt;

            let updatedRecord = await User.create(newRecord);

            updatedRecord.save();
            updatedRecord = updatedRecord?.toObject();
            record.userId = updatedRecord._id;
        } else {
            // record.categoryId = getStr(reqData?.categoryId),
            // record.subCategoryId = getStr(reqData?.subCategoryId),
            // record.questions = (reqData?.questions),
            record.userId = isExistEmail?._id;
        }

        // record.requestType = getStr(reqData.requestType);
        const result = await SupportTicket.findOne({}, {}, { sort: { _id: -1 } }).exec();
        record.categoryId = getStr(reqData?.categoryId),
            record.subCategoryId = getStr(reqData?.subCategoryId),
            // record.questions = (reqData?.questions),
            record.userId = isExistEmail?._id;
        record.ticketId = result ? (parseInt(result.ticketId) + 1).toString().padStart(8, '0') : (1).toString().padStart(8, '0');
        record.reply.push({
            message: getStr(reqData.message),
            attachments: objMaker(req.files, { 'src:filename': getStr })
        });
        record.save().then(async updatedRecord => {
            if (empty(updatedRecord)) return ret.sendFail();
            updatedRecord.userId = record.userId;
            let resData = MakeData.supportTicketDetails(updatedRecord);

            const userReplies = (record?.reply || []).filter(r => r.adminId === null);
            const sortedUserReplies = userReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestReply = sortedUserReplies[0];

            const outputDir = path.resolve(Constant.ROOT_DIR, `../${Constant.STORAGE.LOCAL_FOLDER}`);

            const attachments = [];
            /*  
              const questionList = questionForFile.map((question) => question?.label);
              if (questionForFile?.length) {
                  record?.questions?.forEach((q) => {
                      if (questionList.includes(q?.question)) {
                          for (const answer of (q?.answer || [])) {
  
                              attachments.push({
                                  filename: answer,
                                  path: answer ? path.join(outputDir, 'support-attachment', answer) : '',
                                  contentType: "application/pdf"
                              })
                          }
                      }
                  })
              }
  */
            if (latestReply?.attachments?.length) {
                for (const attachment of latestReply.attachments) {
                    attachments.push({
                        filename: attachment?.src || '',
                        path: attachment.src ? path.join(outputDir, 'support-attachment', attachment.src) : '',
                        contentType: 'application/pdf',
                    });
                }
            }

            const admins = await Admin.find({ isMaster: true });
            admins.forEach((admin) => {
                Notification.create({
                    "receiverId": admin?._id,
                    "receiverType": "Admin",
                    "actionUserId": updatedRecord?.userId,
                    "actionUserType": "User",
                    "moduleId": record?._id,
                    "moduleType": "SupportTicket",
                    "message": "Support Ticket Created",
                })
            })
            const adminMails = admins.map(a => a?.email);
            await supportTicketCreate({ toEmail: adminMails, attachments, ticketId: record?.ticketId, requestType: record?.requestType, userName: reqData.email, email: reqData.email, message: latestReply?.message })
            ret.sendSuccess(resData, Msg.supportTicket.create);
        }).catch(e => ret.err500(e));
    });
};

// History
exports.history = async (req, res) => {
    try {
        const ret = res.ret;
        const _user = req._user;
        const reqData = req.body;

        // Check validation {
        let isInvalid = checkValidation(reqData, {
            filters: 'required',
            pageSize: 'required',
            pageNumber: 'required',
        });
        if (isInvalid) return ret.sendFail(isInvalid);

        if (!empty(reqData.filters.requestType)) {
            isInvalid = checkValidation(reqData.filters, {
                requestType: `required|in:${Constant.ticketRequestTypeKeys.join(',')}`
            });
            if (isInvalid) return ret.sendFail(isInvalid);
        }
        // } Check validation

        // Page calculation {
        const reqFilters = reqData.filters;
        const reqPageSize = reqData.pageSize;
        const reqPageNumber = reqData.pageNumber;

        const limit = reqPageSize;
        const start = limit * (reqPageNumber - 1);
        const orderBy = { createdAt: 'desc' };
        const resData = {
            filters: reqFilters,
            pageSize: limit,
            pageNumber: reqPageNumber,
        };
        // } Page calculation


        // Filters {
        let filters = { userId: req.uid };

        if (!empty(reqFilters.requestType)) filters.requestType = reqFilters.requestType;
        if (!empty(reqFilters.message)) filters.message = { $regex: reqFilters.message, $options: 'i' };
        if (!empty(reqFilters.ticketId)) filters.ticketId = { $regex: reqFilters.ticketId, $options: 'i' };
        // } Filters
        if (!empty(reqFilters.status)) {
            switch (reqFilters.status.toLowerCase()) {
                case 'open':
                    filters.isOpen = true;
                    break;
                case 'close':
                    filters.isOpen = false;
                    break;
                default:
                    break;
            }
        }
        // Make Query {
        const newQuery = () => { return SupportTicket.find(filters).populate('userId').populate('reply.adminId'); };
        // } Make Query

        // Total Count {
        if (reqPageNumber === 1) {
            let totalRecords = await newQuery().exec();
            totalRecords = totalRecords.length;
            resData.totalRecords = totalRecords;
            resData.totalPages = Math.ceil(totalRecords / limit);
        }
        // } Total Count


        newQuery().limit(limit).skip(start).sort(orderBy).then(async records => {
            let newRecords = [];
            (records || []).forEach(row => {
                newRecords.push(MakeData.supportTicketDetails(row));
            });

            resData.records = newRecords;
            ret.sendSuccess(resData, newRecords.length ? Msg.supportTicket.found : Msg.supportTicket.notFound);
        }).catch(err => ret.err500(err));

    } catch (e) { ret.err500(); }

};

exports.reply = async (req, res) => {

    Media.storeSupportAttachment('attachments')(req, res, async (err) => {
        req = formatReqFiles(req);
        const ret = res.ret;
        const reqData = req.body;

        // Check validation {
        const isInvalid = checkValidation(reqData, {
            id: 'required | objectId',
            message: 'required',
        });
        if (isInvalid) return ret.sendFail(isInvalid);
        // } Check validation
        const { id, message } = reqData;

        attachments = objMaker(req.files, { 'src:filename': getStr });

        const reply = {
            message,
            attachments
        };

        const ticketDetail = await SupportTicket.findById(id).exec();
        if (ticketDetail && !ticketDetail.isOpen) {
            return ret.sendFail(Msg.supportTicket.alreadyClosed);
        }
        if (ticketDetail && ticketDetail.isOpen) {
            const result = await SupportTicket.findByIdAndUpdate({ _id: id }, { $push: { reply }, $set: { isDeleted: false, lastRepliedAt: new Date() } }, { returnDocument: 'after' });
            const user = await User.findById(result.userId).lean().exec();
            const replyDetail = MakeData.supportReplyDetails(result.reply[result.reply.length - 1], user);

            const userReplies = (result?.reply || []).filter(r => r.adminId === null);
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

            const admin = await Admin.findOne({ isMaster: true });
            await supportTicketReply({ toEmail: admin.email, attachments, ticketId: result?.ticketId, requestType: result?.requestType, userName: req.user.name, email: req.user.email, message: latestReply?.message })

            return ret.sendSuccess(replyDetail, Msg.supportTicket.reply);
        }
        ret.sendFail(Msg.supportTicket.notFound);
    });
};

// Change status of ticket
exports.updateStatus = async (req, res) => {
    const ret = res.ret;
    try {
        const { id, isOpen } = req.body;
        const isInvalid = checkValidation({ id, isOpen }, {
            id: 'required | objectId',
            isOpen: 'required | boolean'
        });
        if (isInvalid) return ret.sendFail(isInvalid);
        const status = await SupportTicket.findByIdAndUpdate({ _id: id }, { $set: { isOpen } }).exec();
        if (!status) return ret.sendFail(Msg.supportTicket.notFound);
        ret.sendSuccess({}, isOpen ? Msg.supportTicket.open : Msg.supportTicket.close);
    } catch (err) {
        return ret.err500(err);
    }
};

// get single ticket
exports.getSupportTicket = async (req, res) => {
    const ret = res.ret;
    try {
        const { id, ticketId } = req.body;
        let record;
        let isInvalid;
        if (id) {
            isInvalid = checkValidation({ id }, {
                id: 'required | objectId',
            });
            if (isInvalid) return ret.sendFail(isInvalid);
            record = await SupportTicket.findById(id).populate('userId').populate('reply.adminId').exec();
        } else {
            isInvalid = checkValidation({ ticketId }, {
                ticketId: 'required | string',
            });
            if (isInvalid) return ret.sendFail(isInvalid);
            record = await SupportTicket.findOne({ ticketId }).populate('userId').populate('reply.adminId').exec();
        }
        if (!record) return ret.sendFail(Msg.supportTicket.notFound);
        const result = MakeData.supportTicketDetails(record);
        ret.sendSuccess(result, Msg.supportTicket.found);
    } catch (err) {
        return ret.err500(err);
    }
};