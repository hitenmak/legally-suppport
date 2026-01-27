const moment = require('moment');

const flushRewardAndStakeWallet = require('../../jobs/flushRewardAndStakeWallet');
const dailyIncome = require('../../jobs/dailyIncome');
const levelIncome = require('../../jobs/levelIncome');
const stakeComplete = require('../../jobs/stakeComplete');
const bonusIncome = require('../../jobs/bonusIncome');
const networkStat = require('../../jobs/networkStat');
const missedLevel = require('../../jobs/missedLevel');
const updateDailyIncomeOnly = require('../../jobs/updateDailyIncomeOnly');

const User = require('../User');
const Stake = require('../Stake');
// const XUserWalletBackup = require('../XUserWalletBackup');


const { dd, empty, getPercent, flipOnKey, toList, getStr, getFixedDecimal, ex, makeIdList, getDateFormat, ddm } = require('../../helpers/helpers');
const { promise } = require('bcrypt/promises');
const getDate = (days) => moment().add(days, 'days').startOf('day');
const Constant = require('../../config/Constant');

exports.index = async (req, res) => {

    let ret = res.ret;
    let reqData = req.body;
    dd(reqData);
    const addDaysToCronCalculation = getDate(req.params.addDays);
    dd(addDaysToCronCalculation, 'addDaysToCronCalculation');


    // await dailyIncome();
    // await levelIncome();
    // await bonusIncome();
    // await stakeComplete();
    

    // TODO: uncomment flushRewardAndStakeWallet cron and daily income dependent code from daily income cron job
    // await flushRewardAndStakeWallet(addDaysToCronCalculation);
    await dailyIncome(addDaysToCronCalculation);
    await levelIncome(addDaysToCronCalculation);
    if(moment(addDaysToCronCalculation).isBefore(moment(Constant?.bonusIncomeClosingDate).startOf('day'))) await bonusIncome();
    await stakeComplete(addDaysToCronCalculation);
    

    // await updateDailyIncomeOnly(addDaysToCronCalculation);
    /*
    // missed level logic to revert[made with incident case of 2nd August, 2023]
    let missedUsers = [];
    if(!empty(reqData.usernames)) missedUsers = reqData.usernames.split(',');
    dd(missedUsers, 'Missed Users');
    await missedLevel(addDaysToCronCalculation, missedUsers);
    */
    return ret.send(true, {}, 'Cron Running new');
   /* let ret = res.ret;
    let reqData = req.body;
    dd(reqData);


    const addDaysToCronCalculation = getDate(req.params.addDays);
    let ignoreUsers = [];

    // TODO: not uncomment its used for set all user today active
    // if(!empty(reqData.usernames)) ignoreUsers = reqData.usernames.split(',');
    // dd(ignoreUsers, 'Ignore Users');
    await User.updateMany({username: {$nin: ignoreUsers}},{$set:{
    lastActiveDate: moment(reqData.date+'T11:11:00', 'DD-MM-YYYYTHH:mm:ss').add(11, 'hours').format('YYYY-MM-DDTHH:mm:ss.SSS'),
    lastRewardDate: null,
    }})


    dd(addDaysToCronCalculation, 'Add Days To Cron Calculation');
    // users = await User.find({}).lean().exec();

    // const processQueries = [];
    // users.forEach(u=>{
    //     userId = u._id;
    //     u._id = undefined
    //     processQueries.push(
    //         XUserWalletBackup.create({
    //             ...u, userId, cronRunDate:addDaysToCronCalculation, cronRewardDay:moment(addDaysToCronCalculation).add(-1, 'days')
    //         })
    //     );
    // });


    // await Promise.all(processQueries);



    // await Stake.updateMany({},{$set:{ rewardAppliedAt: null, }});

    dd(addDaysToCronCalculation, 'addDaysToCronCalculation');

    await dailyIncome(addDaysToCronCalculation);
    await levelIncome(addDaysToCronCalculation);
    await bonusIncome(addDaysToCronCalculation);
    await stakeComplete(addDaysToCronCalculation);

    // await networkStat();
    return ret.send(true, {}, 'Cron Running');
*/
};


exports.updateDb = async () => {

    // // logWarning(`#ADCP1: PUSHED -  Stake: update user (stakeWallet & lockWallet`);return 1;
    // ddm(`: START - `);
    //
    // let [historyList] = await Promise.all([
    //     await Stake.aggregate([{ $match: {} }, { $group: { _id: '$userId', totalStakingAmount: { $sum: '$amount' } } }]).exec(),
    // ]);
    //
    // let totalRecord = 0;
    // const queryProcess = [];
    //
    //
    //
    // for (const u of historyList) {
    //     totalRecord += 1;
    //     queryProcess.push(User.findByIdAndUpdate(u._id, { $set: {totalStakingAmount: getFixedDecimal(u.totalStakingAmount)}}));
    //
    //
    // }
    // ddm(`: WAITING - `);
    // const processedData = await Promise.all(queryProcess);
    //
    // const invalidData = processedData.filter(r=>{return empty(r)});
    //
    //
    // if(invalidData.length) {
    //     dd(`Note: ${invalidData.length} user total stack amount not updated.`);
    //     dd(invalidData, 'user total stack amount not updated');
    // }
    // const newInsertedRecords = historyList.length;
    //
    //
    // const reportCount = invalidData.length === 0;
    // ddm('');
    // ddm(`: ${reportCount ? 'COMPLETED' : 'ERROR - count not match'}`, reportCount);
    //
    // ddm(`: END -  | (Processed: ${totalRecord}, Saved: ${newInsertedRecords}, Invalid: ${invalidData.length}, Total: ${historyList.length})`);
    //

};