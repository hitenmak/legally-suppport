const moment = require('moment');

// Models
const User = require('../../models/User');

// Helpers
const {d, dd, ddm, empty, checkValidation, getBool, getStr, getNum, getVal, formatNumber, flipOnKey, objMaker, toObjectId, arraySum, makeList, getDateFormat, arrayChunk, capitalizeFirstLetter} = require('../../helpers/helpers');
const Msg = require('../../messages/api');

//---------------------------------------------------------------------------------------------


// Details
exports.details = async(req, res) => {


    const ret = res.ret;
    const reqData = req.body;
    const _user = req._user;


    try {

        // Generate Wallet Address {
        if(!_user?.walletAddress) {
            // new blockchain {
            const response = await BlockchainHelper.generateWalletAddress(_user?._id);
            const walletAddress = response?.walletAddress || null;
            // } new blockchain

            if(!empty(walletAddress)) {
                await User.findByIdAndUpdate(record._id, {$set: {walletAddress}}).lean().exec();
            }
        }
        // } Generate Wallet Address

        DataManipulate.updateNotificationToken(reqData, req.uid);

        // Media Posts {
        let mediaPosts = await MediaPost.find().lean().exec();
        mediaPosts = flipOnKey(mediaPosts, 'key');

        // Our Projects {
        let ourProjectsData = [];
        let tourData = [];

        let ourProjects = mediaPosts['our-projects'] || {};
        if(!empty(ourProjects?.data)) ourProjectsData = JSON.parse(ourProjects?.data) || [];
        ourProjectsData = objMaker(ourProjectsData, {'_id:_id': '', 'image:image': Media.getMediaPost, 'title:title': '', 'youtubeVideoId:youtubeVideoId': ''});
        // } Our Projects


        // Advertisement {
        const advertisementData = {
            isShow: Constant.isShowAdvertisements,
            records: [],
        };
        const advertisements = (!empty(mediaPosts?.advertisement?.data)) ? JSON.parse(mediaPosts?.advertisement?.data) : [];
        advertisements.forEach(r => {

            const videoThumbnail = {
                image: '',
                video: Media.getAdvertisement(r.videoThumbnail),
                youtube: `https://img.youtube.com/vi/${r.post}/maxresdefault.jpg`,
            }[r.type];

            advertisementData.records.push({
                _id: r._id,
                title: getStr(r.title),
                post: r.type === 'youtube' ? r.post : Media.getAdvertisement(r.post),
                url: getStr(r.type === 'image' ? r.url : ''),
                videoThumbnail,
                type: getStr(r.type),
                isShowInPopup: getBool(r.isShowInPopup),
            })
        });

        advertisementData.title = Message.dashboard.newsAndUpdates.title;
        // } Advertisement

        // Media Press {
        let mediaPress = mediaPosts['media-press'] || {};
        if(!empty(mediaPress?.data)) mediaPress = JSON.parse(mediaPress?.data) || {};

        let mediaPressData = {
            isShow: getBool(mediaPress.isShow),
            btnLabel: getStr(mediaPress.btnLabel),
            icon: Media.getMediaPost(mediaPress.icon),
            fileUrl: Media.getMediaPost(mediaPress.fileUrl),
            fileOriginalName: getStr(mediaPress.fileOriginalName),
            fileType: getStr(mediaPress.fileType),
            fileFullName: getStr(mediaPress.fileOriginalName)+getStr(mediaPress.fileType),

        }
        // } Media Press

        // Tours {
        let tours = await Tour.find() || [];
        tourData = tours.map((r) => {
            return {
                _id: r._id,
                image: Media.getMediaPost(r.image),
                title: getStr(r.name),
                isCompleted: getBool(r.isCompleted),
                isOffer: !!r.startDate && !!r.endDate,
            };
        });

        let tourUpcoming = tourData.filter(r => !r.isCompleted);
        let tourCompleted = tourData.filter(r => r.isCompleted);
        // } Tours
        // } Media Posts

        const startOfDay = moment().set({hour: 0, minute: 0, second: 0, millisecond: 0});
        const endOfDay = moment().set({hour: 23, minute: 59, second: 59, millisecond: 999});
        const lastActiveDate = req.user.lastActiveDate;
        const lockWallet = req.user.lockWallet;
        const totalStakeReturn = await Stake.aggregate([{$match: {userId: toObjectId(req.uid), isStakeComplete: false}}, {$group: {_id: null, total: {$sum: {$divide: [{$multiply: ['$amount', '$rewardPer']}, 100]}}}}]);
        const totalStakeReturnValue = !empty(totalStakeReturn) ? totalStakeReturn[0].total : 0;
        const cappedValue = (await LevelManipulate.cappingCalculate(req.user.lockWallet, totalStakeReturnValue))?.rewardCoin ?? 0;
        const myTeam = await DataManipulate.getMyState(req.user);
        const networkState = await DataManipulate.getNetworkStat();
        const appSettingData = await DataManipulate.getAppConfigData();

        if((process.env.MAINTENANCE_USERNAME.split(',')).includes(_user.username)) {
            appSettingData.moduleEnabled.transfer = true;
        }

        networkState.membersIn24Hours = networkState.membersIn24HoursBoost;
        networkState.totalUsers = networkState.totalUsersBoost;
        const isActiveToday = moment(lastActiveDate).isAfter(startOfDay) && moment(lastActiveDate).isBefore(endOfDay);

        let miningStatus = lockWallet > 0 ? (isActiveToday ? 2 : 1) : 0; // 0:fan off, 1: Start mining (Tap to start), 2: fan working
        let miningNote = '';
        /*if(!_user.isIfxActive) { // mining active inactive base on ifx
            miningStatus = 0;
            miningNote = Message.miningNote;
        }*/

        // networkState 0 value set
        networkState.totalYesterdayEarning = "0";
        networkState.membersIn24Hours = "0";
        networkState.membersIn24HoursBoost = "0";
        networkState.totalParticipantsCoin = "0";
        networkState.totalMemberEarningCoin = "0";
        networkState.totalWithdrawalCoin = "0";
        networkState.totalBonusClubIncome = "0";
        networkState.totalUsers = "0";
        networkState.totalUsersBoost = "0";
        networkState.totalDirectReferralIncome = "0";
        networkState.totalInactive = "0";
        networkState.totalWithNoTeam = "0";
        networkState.totalWithTeam = "0";
        networkState.totalInvestor = "0";
        // networkState 0 value set

        const newData = {
            myTeam,
            networkState,
            ourProjects: ourProjectsData,
            advertisements: advertisementData, // TODO: remove after last update
            // newsAndUpdates,
            mediaPress: mediaPressData,
            tourUpcoming,
            tourCompleted,
            isActiveToday: moment(lastActiveDate).isAfter(startOfDay) && moment(lastActiveDate).isBefore(endOfDay),
            ifcDaily: formatNumber(cappedValue > totalStakeReturnValue ? totalStakeReturnValue : cappedValue),
            ifcDailyPercent: formatNumber(100 * moment().diff(startOfDay) / endOfDay.diff(startOfDay), 2),
            ifcTradePrice: await DataManipulate.getTradePlatformData(appSettingData.tradePricePlatform),
            // miningStatus: lockWallet > 0 ? (isActiveToday ? 2 : 1) : 0, // 0:fan off, 1: Start mining (Tap to start), 2: fan working
            miningStatus,
            miningNote,
            zoomMeetingDetails: appSettingData.zoomMeetingDetails,

        };
        // dd(newData);

        ret.sendSuccess(newData, Msg.common.success);

    } catch(e) { ret.err500(e); }
};


// Details
exports.teamDetails = async(req, res) => {

    const ret = res.ret;
    const _user = req._user;

    try {
        const startOfDay = moment().set({hour: 0, minute: 0, second: 0, millisecond: 0});
        const endOfDay = moment().set({hour: 23, minute: 59, second: 59, millisecond: 999});
        const lastActiveDate = req.user.lastActiveDate;
        const lockWallet = req.user.lockWallet;
        const totalStakeReturn = await Stake.aggregate([{$match: {userId: toObjectId(req.uid), isStakeComplete: false}}, {$group: {_id: null, total: {$sum: {$divide: [{$multiply: ['$amount', '$rewardPer']}, 100]}}}}]);
        const totalStakeReturnValue = !empty(totalStakeReturn) ? totalStakeReturn[0].total : 0;
        const cappedValue = (await LevelManipulate.cappingCalculate(req.user.lockWallet, totalStakeReturnValue))?.rewardCoin ?? 0;
        const myTeam = await DataManipulate.getMyState(req.user);
        const networkState = await DataManipulate.getNetworkStat();
        const isActiveToday = moment(lastActiveDate).isAfter(startOfDay) && moment(lastActiveDate).isBefore(endOfDay);
        const ifcPricePredictionMsg = `IFC price prediction goes in range of ${Constant.ifcPricePrediction.from}-${Constant.ifcPricePrediction.to} by ${Constant.ifcPricePrediction.year}`;
        networkState.membersIn24Hours = networkState.membersIn24HoursBoost;
        networkState.totalUsers = networkState.totalUsersBoost;

        // Card Details {
        const cardRequestDetails = await CardRequest.findOne({userId: req.uid}).exec();
        const activeDirectReferral = await User.countDocuments({sponsorId: _user._id, isActive: true}) || 0;
        const isValidActiveStake = _user.totalStakingAmount >= Constant.cardConfig.minActiveStakeAmount;
        const isValidDirectReferral = activeDirectReferral >= Constant.cardConfig.minActiveDirectReferral;
        const cardDetails = {
            cardStatus: empty(cardRequestDetails) ? 100 : getNum(cardRequestDetails.cardStatus),
            // isValidForCard: isValidActiveStake && isValidDirectReferral,
            isValidForCard: getBool(_user.isActive), // now all user valid for card (from client requirement)
            activeStake: {isValid: isValidActiveStake, message: `Stake for 10 or more coins`,},
            directReferral: {isValid: isValidDirectReferral, message: `Make 10 or more active direct referrals`,},
        };
        // } Card Details

        const freezeDate = req?.user?.freezeDate || null;
        const isFreezed = freezeDate ? moment(freezeDate).isBefore() : false;
        const message = freezeDate ? (isFreezed ? Msg.profile.freezed : `${Msg.profile.deactivating} on ${getDateFormat(freezeDate)}, ${Msg.profile.deactivatingMsg}`) : '';

        const withdrawCondition = await WithdrawSettings.findOne().lean().exec();
        let withdrawWarnMsg = '';
        let withdrawWarnCardButton = false;
        if(withdrawCondition?.isActive) {
            const current = moment();
            const startOfCurrentMonthDate = current.clone().date(withdrawCondition.startDate).startOf('day');
            const endOfCurrentMonthDate = current.clone().date(withdrawCondition.endDate).endOf('day');
            const fiveDaysBeforeStartOfCurrentMonthDate = startOfCurrentMonthDate.clone().subtract(5, 'days');
            let customMsg = `You need to deposit and stake ${withdrawCondition.minBuyCoin} coin between ${getDateFormat(startOfCurrentMonthDate)} - ${getDateFormat(endOfCurrentMonthDate)} to continue withdrawal feature. Your withdrawal feature will be discontinued till one month if coins are not deposited.\n*Transferred coins will not be considered.`;

            /*const fixedStartOfCurrentMonthDate = current.clone().date(29).startOf('day');
            const fixedEndOfCurrentMonthDate = current.clone().date(30).endOf('day');
            let customMsg = `You need to deposit and stake ${withdrawCondition.minBuyCoin} coin between ${getDateFormat(fixedStartOfCurrentMonthDate)} - ${getDateFormat(fixedEndOfCurrentMonthDate)} to continue withdrawal feature. Your withdrawal feature will be discontinued till one month if coins are not deposited.\n*Transferred coins will not be considered.`;*/

            withdrawWarnMsg = ''; // `Please "𝙙𝙤 𝙣𝙤𝙩, 𝙙𝙤 𝙣𝙤𝙩" buy and stakes coins during 29th-30th November period`;// TODO: hide message from client requirements // !eligibleResult.status && current.isBetween(fiveDaysBeforeStartOfCurrentMonthDate, endOfCurrentMonthDate )? customMsg: '';
            // withdrawWarnMsg = !eligibleResult.status && current.isBetween(fiveDaysBeforeStartOfCurrentMonthDate, endOfCurrentMonthDate )? customMsg: '';
            withdrawWarnCardButton: false; // TODO: logic of withdrawWarnCardButton enable or disable should be here, for now added static
        }

        const commonConfigKey = 'reward-flush';
        const rewardFlushConfig = (await CommonConfig.findOne({key: commonConfigKey}).exec())?.data;
        // dd(rewardFlushConfig,'rewardFlushConfig')
        let flushCycleMsg = '', flushCurrentPeriod = '', flushNextPeriod = '';

        let flushCycleStartDate = moment(new Date(rewardFlushConfig?.flushCycleDate));
        if(flushCycleStartDate.isBefore(flushCycleStartDate.clone().startOf('month').add(15, 'days'))) {
            flushCycleStartDate = flushCycleStartDate.clone().startOf('month');
        } else if(flushCycleStartDate.isAfter(flushCycleStartDate.clone().startOf('month').add(15, 'days'))) {
            flushCycleStartDate = flushCycleStartDate.clone().startOf('month').add(15, 'days');
        }
        // dd(flushCycleStartDate,'flushCycleStartDate')
        let flushCycleEndDate = flushCycleStartDate.clone().add(parseInt(rewardFlushConfig?.flushCycleDays) - 1, 'days').endOf('day');
        if(!flushCycleStartDate.clone().isSame(flushCycleStartDate.clone().startOf('month').format('YYYY-MM-DD'))) {
            flushCycleEndDate = flushCycleStartDate.clone().endOf('month');
        }
        // dd(flushCycleEndDate,'flushCycleEndDate');
        const nextFlushCycleStartDate = flushCycleEndDate.clone().add(1, 'days').startOf('day');
        let nextFlushCycleEndDate = nextFlushCycleStartDate.clone().add(parseInt(rewardFlushConfig?.flushCycleDays) - 1, 'days').endOf('day');
        if(!nextFlushCycleStartDate.clone().isSame(nextFlushCycleStartDate.clone().startOf('month').format('YYYY-MM-DD'))) {
            nextFlushCycleEndDate = nextFlushCycleStartDate.clone().endOf('month');
        }
        if(rewardFlushConfig?.flushCycleActive && moment().isAfter(moment(new Date(rewardFlushConfig?.flushCycleDate)))) {
            flushCurrentPeriod = `Current Period: ${getDateFormat(flushCycleStartDate)} - ${getDateFormat(flushCycleEndDate)}`;
            flushNextPeriod = `Next Period: ${getDateFormat(nextFlushCycleStartDate)} - ${getDateFormat(nextFlushCycleEndDate)}`;
            flushCycleMsg = `Note: Please utilize your wallet balance before current period end`;
        }

        const badgeConfig = await CommonConfig.findOne({key: 'badge-level'}).exec() || {};
        // console.log(badgeConfig,'badgeConfig');
        let badgeLevel = badgeConfig?.data?.length ? JSON.parse(badgeConfig?.data) : [];
        // console.log(badgeLevel,'badgeLevel-parse-data');
        if(empty(badgeLevel)){
            throw {
                isError: true,
                message: "Badge level config data not found",
            }
        }

        let badge = getStr(capitalizeFirstLetter(_user?.badge?.name ?? ''));
        let badgeColor = '', badgeImage = '';
        for (const badge of badgeLevel ?? []) {
            if(_user?.badge?.name == badge.badgeName) {
                badgeColor = getStr(badge?.hex);
                badgeImage = getStr(badge?.imageUrl);
                break;
            }
        }

        let miningStatus = lockWallet > 0 ? (isActiveToday ? 2 : 1) : 0; // 0:fan off, 1: Start mining (Tap to start), 2: fan working
        let miningNote = '';
        /*if(!_user.isIfxActive) { // mining active inactive base on ifx
            miningStatus = 0;
            miningNote = Message.miningNote;
        }*/
        let badgeEligbleBox = Message.badgeEligibleBox;
        badge = badge.toLowerCase() == 'normal' ? '' : badge;
        if(moment().isBefore(moment(Constant.ifcBadgeRestartDate).startOf('day'))){
            badgeEligbleBox.title = '';
            badgeEligbleBox.description = '';
            badgeEligbleBox.buttonText = '';
            badgeEligbleBox.isButtonVisible = false;
            badgeEligbleBox.isBadgeEligibleBoxVisible = false;
            badge = '';
            badgeColor = '';
            badgeImage = '';
        }

        // networkState 0 value set
        networkState.totalYesterdayEarning = "0";
        networkState.membersIn24Hours = "0";
        networkState.membersIn24HoursBoost = "0";
        networkState.totalParticipantsCoin = "0";
        networkState.totalMemberEarningCoin = "0";
        networkState.totalWithdrawalCoin = "0";
        networkState.totalBonusClubIncome = "0";
        networkState.totalUsers = "0";
        networkState.totalUsersBoost = "0";
        networkState.totalDirectReferralIncome = "0";
        networkState.totalInactive = "0";
        networkState.totalWithNoTeam = "0";
        networkState.totalWithTeam = "0";
        networkState.totalInvestor = "0";
        // networkState 0 value set

        const newData = {
            cardDetails,
            isFreezed: getBool(isFreezed),
            isFreezeWarn: getBool(freezeDate ? (isFreezed ? false : true) : false),
            message: getStr(message),
            withdrawWarnMsg: getStr(withdrawWarnMsg),
            withdrawWarnCardButton: getBool(withdrawWarnCardButton),
            flushCycleMsg: {
                currentPeriod: getStr(flushCurrentPeriod),
                nextPeriod: getStr(flushNextPeriod),
                message: getStr(flushCycleMsg),
            },
            myTeam,
            networkState,
            // miningStatus: lockWallet > 0 ? (isActiveToday ? 2 : 1) : 0, // 0:fan off, 1: Start mining (Tap to start), 2: fan working
            miningStatus,
            miningNote,
            ifcDaily: formatNumber(cappedValue > totalStakeReturnValue ? totalStakeReturnValue : cappedValue),
            ifcDailyPercent: formatNumber(100 * moment().diff(startOfDay) / endOfDay.diff(startOfDay), 2),
            ifcTradePrice: await DataManipulate.getTradePlatformData(),
            shareAndShineContestCard: MakeData.shareAndShineContestData(Message.shareAndShineContest),
            exchangeOwnershipCard: {
                ...Message.exchangeOwnership,
                ...Constant.exchangeOwnership,
            },
            announcement: Constant.announcement, // make sure with app before change
            ifcPricePrediction: { ...Constant.ifcPricePrediction, description: ifcPricePredictionMsg}, // make sure with app before change
            badge,
            badgeColor,
            badgeUpdateDate: getDateFormat(_user?.badgeUpdateDate),
            badgeEligbleBox: Message.badgeEligibleBox,
            coinSellingBox: Message.coinSellingBox,
            badgeData: { ...Message.badgeEligibleBox, badge: badge.toUpperCase(), badgeColor, badgeImage },
            swapCoinBox: Message.swapCoinBox,
            ifxUsdtWallet: formatNumber(_user.ifxUsdtWallet),
        };


        ret.sendSuccess(newData, Msg.common.success);

    } catch(e) { ret.err500(e); }
};