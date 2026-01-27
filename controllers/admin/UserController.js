const moment = require('moment');
const fs = require('fs');

// Models
const User = require('../../models/User');
const SupportTicket = require('../../models/SupportTicket');


// Helpers
const {d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, timeSince, formatNumber, toObjectId, isObjectId, getStr, getVal, filterUsername, getDateFormat, objMaker, getFixedDecimal} = require('../../helpers/helpers');
const {getFullUrlAction} = require('../../helpers/ejsHelpers');
const Msg = require('../../messages/admin');
const Constant = require('../../config/Constant');
const Media = require('../../infrastructure/Media/Media');

const Pager = require('../../infrastructure/Pager');

//---------------------------------------------------------------------------------------------


// Index View
exports.index = async(req, res) => {
    const ret = res.ret;
    try{
        return ret.render('user/list', {});
    }catch(err){
        console.error(err, 'err-user-index');
        return ret.err500(err);
    }
};


// list
exports.list = async(req, res) => {
    const ret = res.ret;
    try {
        const reqData = req.body;
        let filters = {};
        
        // Page calculation {
        const Pgr = new Pager(reqData);
        if(Pgr.isValidData) return ret.sendFail(Pgr.isValidData);
        let isSortCreatedAt = reqData?.orderBy?.createdAt && (Object.keys(reqData?.orderBy).length == 1) && Object.keys(reqData?.orderBy)[0] == 'createdAt';
        let options = {
            page: reqData?.pageNumber || 1,
            limit: 10,
            // populate: 'userId',
            sort: isSortCreatedAt ? { lastRepliedAt: 'desc', ...reqData?.orderBy } : reqData?.orderBy,
            lean: true
        }
        // } Page calculation

        // Filters {
        if(!empty(Pgr.commonSearchFilters)) filters = {...Pgr.commonSearchFilters};
        // d(filters, 'filters');
        // } Filters

        // Make Query {
        const pager = await User.paginate(filters, options);
        // } Make Query


        let newRecords = [];
        if(!empty(pager.docs)) {
            (pager.docs || []).forEach((row, i) => {
                let user = row._id || {};
                // dd(user);
                row.userReference = {
                    redirectUrl: getFullUrlAction('user/details/' + user._id),
                    label: user.name || '',
                };

                row.name = row.name;
                row.username = row.username;
                row.actionDetails = getFullUrlAction('support-tickets/' + row._id);
                // row.actionDeleteDirect = row.isDeleted ? null : getFullUrlAction('user/delete/' + row._id);
                row.createdAt = timeSince(row.createdAt);
                newRecords.push(row);
            });
        }
        const resData = {records: newRecords, pageNumber: pager.page, totalPages: pager.totalPages, totalRecords: pager.totalDocs, limit: pager.limit,}

        ret.sendSuccess(resData, 'Record found');
    } catch(e) { console.log(e); ret.err500(e); }
};

// Details
exports.details = async(req, res) => {
    const ret = res.ret;
    const id = req.params.id || '';
    const resData = {record: {}};
    const filters = isObjectId(id) ? {_id: id} : ((new RegExp(`(0x)[a-zA-Z0-9]{1,40}`).test(id)) ? {walletAddress: {$regex: id, $options: 'i'}} : {username: id.toLowerCase()});
    let record = await User.findOne(filters).populate('sponsorId').lean().exec();
    if(empty(record)) {
        const walletHistoryRecord = await WalletHistory.findOne({transactionId: id}).lean().exec();
        if(empty(walletHistoryRecord)) return ret.goBackError()
        record = await User.findOne({_id: walletHistoryRecord.userId}).populate('sponsorId').lean().exec();
        if(empty(record)) return ret.goBackError();
    }

    record.profileImage = Media.getAdminUserImage(record.profileImage);
    record.lastActiveDate = timeSince(record.lastActiveDate);
    record.stakeWallet = formatNumber(record.stakeWallet);
    record.lockWallet = formatNumber(record.lockWallet);
    record.rewardWallet = formatNumber(record.rewardWallet);
    // ifx {
    record.ifxStakeWallet = formatNumber(record.ifxStakeWallet);
    record.ifxLockWallet = formatNumber(record.ifxLockWallet);
    record.ifxRewardWallet = formatNumber(record.ifxRewardWallet);
    // } ifx

    // usdt {
    record.usdtStakeWallet = formatNumber(record.usdtStakeWallet);
    record.usdtLockWallet = formatNumber(record.usdtLockWallet);
    record.usdtRewardWallet = formatNumber(record.usdtRewardWallet);
    // } usdt
    record.sponsor = {};

    // Direct Referral Members
    var directReferralMembers = await User.find({sponsorId: record?._id+''}).lean() || [];
    record.directReferralMembers = [];
    directReferralMembers.forEach((directReferralMember, i) => {
        var phoneCode = directReferralMember.phoneCode || '';
        var phone = directReferralMember.phone || '';
        record.directReferralMembers.push({
            name: directReferralMember.name || '',
            username: directReferralMember.username || '',
            profileImage: fs.existsSync(Media.getAdminUserImage(directReferralMember.profileImage || '')) || '/fw2ezuyzb751/img/admin-profile-default.jpg',
            actionDetails: getFullUrlAction('user/details/' + directReferralMember._id || ''),
            phoneNumber: phoneCode + phone
        });
    });
    // Direct Referral Members

    if(!empty(record.sponsorId)) {
        var phoneCode = record.sponsorId?.phoneCode || '';
        var phone = record.sponsorId?.phone || '';
        record.sponsor = {
            name: record.sponsorId?.name || '',
            username: record.sponsorId?.username || '',
            profileImage: Media.getAdminUserImage(record.sponsorId?.profileImage || ''),
            actionDetails: getFullUrlAction('user/details/' + record.sponsorId?._id || ''),
            phoneNumber: phoneCode + phone
        };

    }

    const freezeDate = record?.freezeDate || null;
    const isFreezed = freezeDate ? moment(freezeDate).isBefore() : false;

    record.freezeStatus = record?.freezeDate ? (isFreezed ? `${Msg.profile.deactivated} on ${getDateFormat(record?.freezeDate)}` : `${Msg.profile.deactivate} in ${Math.round(moment.duration(moment(record?.freezeDate).diff(moment())).asDays())} days, on ${getDateFormat(record?.freezeDate)}`) : ``;
    record.sponsorId = undefined;

    record.lastActiveHistory = record.lastActiveHistory || [];
    record.lastActiveHistory.reverse();
    (record.lastActiveHistory || []).forEach((v, i) => {
        record.lastActiveHistory[i] = getDateFormat(v, 'D MMM YY, h:mm:ss A');
    });

    record = {...record, ...await DataManipulate.userRewardWallet(record._id)};

    record.myTeam = {}; //await DataManipulate.getMyState(record._id);
    record.ifxMyTeam = {}; // await DataManipulate.getMyStateIfx(record);
    record.update2faStatusUrl = getFullUrlAction('user/update-2fa-status/' + record._id);
    record.updateStatusUrl = getFullUrlAction('user/update-status/' + record._id);
    record.deleteUserUrl = getFullUrlAction('user/delete/' + record._id);

    const startOfCurrentMonth = moment().startOf('month').startOf('day');
    const endOfCurrentMonth = moment().endOf('month').endOf('day');
    const startOfPreviousMonth = moment().subtract(1, 'months').startOf('month').startOf('day');
    const endOfPreviousMonth = moment().subtract(1, 'months').endOf('month').endOf('day');
    const queryArr = [
        DailyIncome.find({userId: record._id}).sort({date: -1}).limit(10),
        LevelIncome.find({userId: record._id}).sort({date: -1}).limit(10),
        WithdrawRequest.find({userId: record._id}).sort({createdAt: -1}).limit(10),
        BonusIncome.find({userId: record._id}),
        WalletHistory.find({userId: record._id}).sort({createdAt: -1}).limit(10),
        WithdrawRequestUsdt.find({userId: record._id}).sort({createdAt: -1}).limit(10),
        DirectReferralIncome.aggregate([
            { $match: { userId: record._id, createdAt: { $gte: new Date(startOfPreviousMonth), $lte: new Date(endOfCurrentMonth) } } },
            { $lookup: { from: 'users', localField: 'referralUserId', foreignField: '_id', as: 'user'} },
            { $unwind: '$user' },
            {
                $facet: {
                    currentMonth: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(startOfCurrentMonth),
                                    $lte: new Date(endOfCurrentMonth)
                                }
                            }
                        },
                    ],
                    previousMonth: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(startOfPreviousMonth),
                                    $lt: new Date(endOfPreviousMonth)
                                }
                            }
                        },
                    ]
                }
            },
        ]),
        Stake.find({userId: record._id}).sort({date: -1}).limit(10),
    ]
    const [
        dailyIncome,
        levelIncome,
        withdrawRequest,
        bonusIncome,
        buyCoin,
        withdrawRequestUsdt,
        directReferralIncome,
        stake,

        ifxStake,
        ifxDailyIncome,
        ifxLevelIncome,
        ifxWithdrawRequest,
        ifxBuyCoin,
        ifxLevelIncomeTotal,

        usdtStake,
        usdtDailyIncome,
        usdtLevelIncome,
        usdtWithdrawRequest,
        usdtBuyCoin,
        usdtLevelIncomeTotal,
    ] = await Promise.all(queryArr).catch((err) => console.log(err));

    // ifx {
    resData.ifxStake = objMaker(!empty(ifxStake) ? ifxStake : [], {
        '_id:_id': '',
        'createdAt:createdAt': getDateFormat,
        'expiredAt:expiredAt': getDateFormat,
        'rewardPer:rewardPer': formatNumber,
        'amount:amount': formatNumber,
        'isStakeComplete:isStakeComplete': getBool,
    }) || [];

    resData.ifxDailyIncomes = objMaker(!empty(ifxDailyIncome) ? ifxDailyIncome : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'rewardPer:rewardPer': formatNumber,
        'amount:amount': formatNumber,
        'isLevelRewardAdded:isLevelRewardAdded': getBool,
        'usdPrice:usdPrice': formatNumber,
        'amountUsdt:amountUsdt': formatNumber,
    }) || [];

    resData.ifxLevelIncomes = objMaker(!empty(ifxLevelIncome) ? ifxLevelIncome : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'amount:amount': formatNumber,
        'usdPrice:usdPrice': formatNumber,
        'amountUsdt:amountUsdt': formatNumber,
    }) || [];

    resData.ifxWithdrawRequest = objMaker(!empty(ifxWithdrawRequest) ? ifxWithdrawRequest : [], {
        '_id:_id': '',
        'amount:amount': formatNumber,
        'platformFee:platformFee': formatNumber,
        'platformFeePercent:platformFeePercent': '',
        'finalAmount:finalAmount': formatNumber,
        'approveTime:approveTime': getDateFormat,
        'createdAt:createdAt': getDateFormat,
        'transactionId:transactionId': getStr,
        'walletAddress:walletAddress': getStr,
        'status:status': '',
    }) || [];

    resData.ifxBuyCoin = objMaker(!empty(ifxBuyCoin) ? ifxBuyCoin : [], {
        '_id:_id': '',
        'date:createdAt': getDateFormat,
        'amount:amount': formatNumber,
        'transactionId:transactionId': getStr,
    }) || [];

    // last active date history {
    record.ifxLastActiveDate = record?.ifxLastActiveDate ? getDateFormat(record.ifxLastActiveDate, 'D MMM YY, h:mm:ss A') : '';
    record.ifxLastActiveHistory = record.ifxLastActiveHistory || [];
    record.ifxLastActiveHistory.reverse();
    (record.ifxLastActiveHistory || []).forEach((v, i) => {
        record.ifxLastActiveHistory[i] = getDateFormat(v, 'D MMM YY, h:mm:ss A');
    });
    // } last active date history

    record.ifxTeamReward = getFixedDecimal(ifxLevelIncomeTotal?.[0]?.total);
    // } ifx

    // usdt {
    resData.usdtStake = objMaker(!empty(usdtStake) ? usdtStake : [], {
        '_id:_id': '',
        'createdAt:createdAt': getDateFormat,
        'expiredAt:expiredAt': getDateFormat,
        'rewardPer:rewardPer': formatNumber,
        'amount:amount': formatNumber,
        'isStakeComplete:isStakeComplete': getBool,
    }) || [];

    resData.usdtDailyIncomes = objMaker(!empty(usdtDailyIncome) ? usdtDailyIncome : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'rewardPer:rewardPer': formatNumber,
        'amount:amount': formatNumber,
        'isLevelRewardAdded:isLevelRewardAdded': getBool,
        // 'usdPrice:usdPrice': formatNumber,
        // 'amountUsdt:amountUsdt': formatNumber,
    }) || [];

    resData.usdtLevelIncomes = objMaker(!empty(usdtLevelIncome) ? usdtLevelIncome : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'amount:amount': formatNumber,
        // 'usdPrice:usdPrice': formatNumber,
        // 'amountUsdt:amountUsdt': formatNumber,
    }) || [];

    resData.usdtWithdrawRequest = objMaker(!empty(usdtWithdrawRequest) ? usdtWithdrawRequest : [], {
        '_id:_id': '',
        'amount:amount': formatNumber,
        'platformFee:platformFee': formatNumber,
        'platformFeePercent:platformFeePercent': '',
        'finalAmount:finalAmount': formatNumber,
        'approveTime:approveTime': getDateFormat,
        'createdAt:createdAt': getDateFormat,
        'transactionId:transactionId': getStr,
        'walletAddress:walletAddress': getStr,
        'status:status': '',
    }) || [];

    resData.usdtBuyCoin = objMaker(!empty(usdtBuyCoin) ? usdtBuyCoin : [], {
        '_id:_id': '',
        'date:createdAt': getDateFormat,
        'amount:amount': formatNumber,
        'transactionId:transactionId': getStr,
    }) || [];

    // last active date history {
    record.usdtLastActiveDate = record?.usdtLastActiveDate ? getDateFormat(record.usdtLastActiveDate, 'D MMM YY, h:mm:ss A') : '';
    record.usdtLastActiveHistory = record.usdtLastActiveHistory || [];
    record.usdtLastActiveHistory.reverse();
    (record.usdtLastActiveHistory || []).forEach((v, i) => {
        record.usdtLastActiveHistory[i] = getDateFormat(v, 'D MMM YY, h:mm:ss A');
    });
    // } last active date history

    record.usdtTeamReward = getFixedDecimal(usdtLevelIncomeTotal?.[0]?.total);
    // } usdt

    resData.stake = objMaker(!empty(stake) ? stake : [], {
        '_id:_id': '',
        'createdAt:createdAt': getDateFormat,
        'expiredAt:expiredAt': getDateFormat,
        'rewardPer:rewardPer': formatNumber,
        'amount:amount': formatNumber,
        'isStakeComplete:isStakeComplete': getBool,
    }) || [];

    resData.dailyIncomes = objMaker(!empty(dailyIncome) ? dailyIncome : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'amount:amount': formatNumber,
        'isLevelRewardAdded:isLevelRewardAdded': getBool,
        'ifcPrice:ifcPrice': formatNumber,
        'ROIInDollar:ROIInDollar': formatNumber,
    }) || [];

    resData.levelIncomes = objMaker(!empty(levelIncome) ? levelIncome : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'amount:amount': formatNumber,
        'ifcPrice:ifcPrice': formatNumber,
        'ROIInDollar:ROIInDollar': formatNumber,
    }) || [];

    resData.withdrawRequest = objMaker(!empty(withdrawRequest) ? withdrawRequest : [], {
        '_id:_id': '',
        'amount:amount': formatNumber,
        'platformFee:platformFee': formatNumber,
        'platformFeePercent:platformFeePercent': '',
        'finalAmount:finalAmount': formatNumber,
        'approveTime:approveTime': getDateFormat,
        'createdAt:createdAt': getDateFormat,
        'transactionId:transactionId': getStr,
        'walletAddress:walletAddress': getStr,
        'status:status': '',
    }) || [];

    resData.withdrawRequestUsdt = objMaker(!empty(withdrawRequestUsdt) ? withdrawRequestUsdt : [], {
        '_id:_id': '',
        'amount:amount': formatNumber,
        'platformFee:platformFee': formatNumber,
        'platformFeePercent:platformFeePercent': '',
        'finalAmount:finalAmount': formatNumber,
        'approveTime:approveTime': getDateFormat,
        'createdAt:createdAt': getDateFormat,
        'transactionId:transactionId': getStr,
        'walletAddress:walletAddress': getStr,
        'status:status': '',
    }) || [];

    resData.bonusIncome = objMaker(!empty(bonusIncome?.[0]?.rewardHistory) ? bonusIncome?.[0]?.rewardHistory?.reverse() : [], {
        '_id:_id': '',
        'date:date': getDateFormat,
        'amount:rewardCoin': formatNumber,
        'ifcPrice:ifcPrice': formatNumber,
        'ROIInDollar:ROIInDollar': formatNumber,
    }) || [];

    resData.buyCoin = objMaker(!empty(buyCoin) ? buyCoin : [], {
        '_id:_id': '',
        'date:createdAt': getDateFormat,
        'amount:amount': formatNumber,
        'transactionId:transactionId': getStr,
        'transactionType:transactionType': getStr,
        'status:status': getStr,
    }) || [];

    resData.directReferralIncome = {
        currentMonth: objMaker(!empty(directReferralIncome?.[0]?.currentMonth) ? directReferralIncome?.[0]?.currentMonth : [], {
            '_id:_id': '',
            'date:createdAt': getDateFormat,
            'amount:amount': formatNumber,
            'referralUserId:user': (user) => getStr(user._id),
            'referralName:user': (user) => getStr(user.name),
            'referralUsername:user': (user) => getStr(user.username),
            'referralUserUrl:user': (user) => `${getFullUrlAction('user/details/'+getStr(user._id))}`,
            'name:user': (user) => getStr(user.name),
            'stake:stake': getStr,
            'status:status': getStr,
        }) || [],
        previousMonth: objMaker(!empty(directReferralIncome?.[0]?.previousMonth) ? directReferralIncome?.[0]?.previousMonth : [], {
            '_id:_id': '',
            'date:createdAt': getDateFormat,
            'amount:amount': formatNumber,
            'referralUserId:user': (user) => user._id,
            'referralName:user': (user) => getStr(user.name),
            'referralUsername:user': (user) => getStr(user.username),
            'referralUserUrl:user': (user) => `${getFullUrlAction('user/details/'+user._id)}`,
            'name:user': (user) => getStr(user.name),
            'stake:stakeAmount': formatNumber,
            'status:status': getStr,
        }) || [],
    }

    // support Tickets {
    const supportTickets = await SupportTicket.find({userId: record._id, isDeleted: {$ne: true}}).sort('-_id').lean() || [];
    record.supportTickets = objMaker(supportTickets, {'_id:_id': '', 'ticketId:ticketId': '', 'isOpen:isOpen': getBool, 'requestType:requestType': (type)=>{return Constant.ticketRequestType[type]}, 'detailsUrl:_id': (id)=>{return getFullUrlAction('support-ticket/details/'+id)}})
    record.ticketRequestType = Constant.ticketRequestType;
    // } support Tickets

    resData.record = record;

    // performance config {
    // resData.performanceConfig = structuredClone(Constant.performanceMeter.coinRequired);
    // } performance config
    ret.render('user/details', resData);
};

// Update 2fa Status
exports.update2FaStatus = async(req, res) => {

    const ret = res.ret;
    let userId = req.params.id;
    if(!isObjectId(userId)) return ret.goBackError();

    let newRecord = await User.findById(userId);
    if(empty(newRecord)) return ret.goBackError();

    newRecord.is2faEnable = !newRecord.is2faEnable;

    newRecord.save().then(async updatedRecord => {
        if(empty(updatedRecord)) return ret.goBackError();
        ret.redirect('user/details/' + userId, updatedRecord.is2faEnable ? Msg.userProfile.enable2fa : Msg.userProfile.disable2fa);

    }).catch(e => ret.goBackError());

};


// Update user status (enable disable user)
exports.updateStatus = async(req, res) => {

    const ret = res.ret;
    let userId = req.params.id;
    if(!isObjectId(userId)) return ret.goBackError();

    let newRecord = await User.findById(userId);
    if(empty(newRecord)) return ret.goBackError();

    newRecord.status = !newRecord.status;

    newRecord.save().then(async updatedRecord => {
        if(empty(updatedRecord)) return ret.goBackError();
        ret.redirect('user/details/' + userId, updatedRecord.status ? Msg.userProfile.enableUser : Msg.userProfile.disableUser);

    }).catch(e => ret.goBackError());

};


// Update user details (enable disable user)
exports.updateDetails = async(req, res) => {

    const ret = res.ret;
    const reqData = req.body;

    dd(reqData);

    // Check validation {
    const isInvalid = checkValidation(reqData, {
        id: 'required | objectId',
        name: 'required',
        email: 'required',
        phone: 'required',
    });
    if(isInvalid) return ret.goBackError(isInvalid);
    // } Check validation

    const isExistEmail = await User.findOne({_id: {$ne: reqData.id}, email: filterUsername(reqData.email)}).exec();
    if(!empty(isExistEmail)) return ret.goBackError(Msg.auth.emailAlreadyExist);

    const isExistPhone = await User.findOne({_id: {$ne: reqData.id}, phone: reqData.phone}).exec();
    if(!empty(isExistPhone)) return ret.goBackError(Msg.auth.phoneAlreadyExist);

    let record = await User.findById(reqData.id);
    if(empty(record)) return ret.goBackError();

    record.name = getVal(reqData.name);
    record.email = getVal(reqData.email);
    record.phone = getVal(reqData.phone);

    if(!empty(reqData.delete_wallet_address)) {
        record.withdrawWalletAddresses = record.withdrawWalletAddresses.filter(r => {
            return (!reqData.delete_wallet_address.includes(r._id.toString()))
        })
    }
    record.save().then(async updatedRecord => {
        if(empty(updatedRecord)) return ret.goBackError();
        ret.goBackSuccess(Msg.userProfile.detailsUpdated);

    }).catch(e => {
        dd(e);
        ret.goBackError();
    });

};

// Update user delete/terminate (enable disable user)
exports.deleteUser = async(req, res) => {

    const ret = res.ret;
    let userId = req.params.id;
    if(!isObjectId(userId)) return ret.goBackError();

    let newRecord = await User.findById(userId);
    if(empty(newRecord)) return ret.goBackError();

    newRecord.isTerminated = !newRecord.isTerminated;

    newRecord.save().then(async updatedRecord => {
        if(empty(updatedRecord)) return ret.goBackError();
        ret.redirect('user/details/' + userId, Msg.userProfile.recover);

    }).catch(e => ret.goBackError());

};

exports.toggleChange = async(req, res) => {
    const ret = res.ret;
    const reqData = req.body;
    let userId = reqData.id;

    const isInvalid = checkValidation(reqData, {
        id: 'required',
        dataToggleType: 'required',
    });
    if (isInvalid) {
        return ret.sendFail(isInvalid);
    }
    
    let newRecord = await User.findById(reqData.id);
    if (empty(newRecord)) {
        return ret.sendFail();
    }

    if (reqData.dataToggleType == 'isOtpEnable') {
        newRecord.isOtpEnable = newRecord.isOtpEnable ? false: true;
    }

    if (reqData.dataToggleType == 'isIfxLevelIncomeEnable') {
        newRecord.isIfxLevelIncomeEnable = newRecord.isIfxLevelIncomeEnable ? false: true;
    }
    if (reqData.dataToggleType == 'isIfxWithdrawEnable') {
        newRecord.isIfxWithdrawEnable = newRecord?.isIfxWithdrawEnable ? false: true;
    }

    if (reqData.dataToggleType == 'isUsdtLevelIncomeEnable') {
        newRecord.isUsdtLevelIncomeEnable = newRecord.isUsdtLevelIncomeEnable ? false: true;
    }
    if (reqData.dataToggleType == 'isUsdtWithdrawEnable') {
        newRecord.isUsdtWithdrawEnable = newRecord?.isUsdtWithdrawEnable ? false: true;
    }

    if (reqData.dataToggleType == 'isLevelIncomeEnable') {
        newRecord.isLevelIncomeEnable = newRecord.isLevelIncomeEnable ? false: true;
    }
    if (reqData.dataToggleType == 'isIfcWithdrawEnable') {
        newRecord.isIfcWithdrawEnable = newRecord?.isIfcWithdrawEnable ? false: true;
    }

    if (reqData.dataToggleType == 'accessControlsIsTransferEnabled') {
        newRecord.accessControls = {...newRecord?.accessControls, isTransferEnabled: !newRecord?.accessControls?.isTransferEnabled};
    }

    newRecord.save().then(async updatedRecord => {
        if(empty(updatedRecord)) {
            return ret.sendFail();
        }
        ret.sendSuccess(Msg.userProfile.recover);
    }).catch(e => ret.sendFail());
};

exports.rewardWalletRemoveToggleChange = async(req, res) => {
    const ret = res.ret;
    const reqData = req.body;
    let userId = reqData.id;

    const isInvalid = checkValidation(reqData, {
        id: 'required',
    });
    if (isInvalid) {
        return ret.sendFail(isInvalid);
    }
    
    let newRecord = await User.findById(reqData.id);
    if (empty(newRecord)) {
        return ret.sendFail();
    }

    if (newRecord.rewardWallet > 0) {
        newRecord.oldRewardWallet = newRecord.rewardWallet;
        newRecord.rewardWallet = 0;
    } else {
        newRecord.rewardWallet = newRecord.oldRewardWallet;
    }

    newRecord.save().then(async updatedRecord => {

        if(empty(updatedRecord)) {
            return ret.sendFail();
        }
        ret.sendSuccess(Msg.userProfile.recover);
    }).catch(e => ret.sendFail());
};
