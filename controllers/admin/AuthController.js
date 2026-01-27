// Models
const Admin = require('../../models/Admin');
// const DailyIncome = require('../../models/DailyIncome');
// const LevelIncome = require('../../models/LevelIncome');
const User = require('../../models/User');
const GenerateFile = require('../../infrastructure/GenerateFile');

// Helpers
const { d, dd, empty, checkValidation, getNum, formatNumber, flipOnKey, getFixedDecimal, getDateFormat} = require('../../helpers/helpers');
const { makeHashPassword, matchHashPassword, generateJwtToken } = require('../../helpers/auth');
const Msg = require('../../messages/admin');

//---------------------------------------------------------------------------------------------


// Index View
exports.index = async (req, res) => {
    const ret = res.ret;
    ret.render('auth/login', {}, null, true);
};


exports.check = async (req, res) => {
    const ret = res.ret;
    const reqData = req.body;

    // Check validation {
    const isInvalid = checkValidation(reqData, {
        email: 'required',
        password: 'required',
    });
    if (isInvalid) return ret.goBackError(isInvalid);
    // } Check validation

    Admin.findOne({ email: reqData.email }).then(record => {
        if (empty(record)) return ret.goBackError(Msg.auth.credentialNotMatch);
        if (!record.isActive) return ret.goBackError(Msg.auth.accountNotAccess);

        const isMatch = matchHashPassword(reqData.password, record.hash, record.salt);
        if (!isMatch) return ret.goBackError(Msg.auth.credentialNotMatch);

        const user = { ...record._doc, id: record._id.toString(), _id: record._id.toString(), hash: '', salt: '', };
        req.session.token = generateJwtToken(user);

        return ret.redirect('dashboard');
        // return ret.redirect('users');

    }).catch(err => {
        dd(err);
        return ret.render('errors/500');
    });
};



exports.logout = async (req, res) => {
    const ret = res.ret;
    req.session.token = null;

    // ret.redirect('logout/sleep', {}, null, true);
    ret.redirect('login', {}, null, true);
};


exports.logoutSleep = async (req, res) => {
    const ret = res.ret;
    // return ret.render('auth/sleep', {}, null, true);
    return ret.render('auth/login', {}, null, true);
};


exports.history = async (req, res) => {
    const ret = res.ret;
    try {

        const day = req.params.day;
        const returnType = req.params.type;

        filters = {date: new Date('2023-08-'+day+'T18:29:59.999Z')};
        const [dailyIncomeRecords, levelIncomeRecords] = await Promise.all([
            await DailyIncome.find(filters).select('_id userId amount date').sort({ date: 'desc' }).lean(),
            // await DirectReferralIncome.find(filtersCreatedAt).sort({ date: 'desc' }).lean(),
            await LevelIncome.find(filters).select('_id userId amount date').sort({ date: 'desc' }).lean(),
            // await BonusIncome.aggregate([
            //     {$unwind: '$rewardHistory'},
            //     {$match: filtersBonusIncome},
            //     {$project: { date: '$rewardHistory.date', amount:'$rewardHistory.rewardCoin', ROIInDollar: '$rewardHistory.ROIInDollar' }}
            // ]),
        ]);

        let datedRewardOnKey = {};
        let userIds = [];
        // dd([dailyIncomeRecords[0],directReferralIncomeRecords[0], levelIncomeRecords[0]]);

        // Daily Income {
        (dailyIncomeRecords || []).forEach(row => {
            const key = row.userId+'';
            if(empty(datedRewardOnKey[key])) datedRewardOnKey[key] = {reward: 0};
            datedRewardOnKey[key].reward += getNum(row.amount);
            if(!userIds.includes(key)) userIds.push(key);
        });
        // } Daily Income



        // Level Income {
        (levelIncomeRecords || []).forEach(row => {
            const key = row.userId+'';
            if(empty(datedRewardOnKey[key])) datedRewardOnKey[key] = {reward: 0};
            datedRewardOnKey[key].reward += getNum(row.amount);
            if(!userIds.includes(key)) userIds.push(key);

            // if(datedRewardOnKey[key].reward < 5) delete datedRewardOnKey[key];
        });
        // } Level Income
        users = flipOnKey(await User.find({_id: {$in: userIds}}).select('_id username email phone') || []);

        // Object To Index Array {
        let newRecords = [];
        for (let k in datedRewardOnKey) {
            const row = datedRewardOnKey[k];
            if(row.reward < 5 ) continue;
            const userRow = users[k] || {}
            newRecords.push({
                _id: userRow._id || null,
                userId: k,
                username: userRow.username || null,
                email: userRow.email || null,
                phone: userRow.phone || null,
                reward: getFixedDecimal(row.reward),
            });
        }
        // } Object To Index Array

        const sortArr = (arr) => {
            arr.sort((valA, valB) => valA['reward'] - valB['reward'])
            return arr
        }

        // converted = ''
        // if(returnType = 'psv') {
        //
        // }
        newRecords = sortArr(newRecords)
        // const generateFile = new GenerateFile();
        // const path = await generateFile.json2csv(newRecords, getDateFormat(new Date()));
        ret.sendSuccess(newRecords);
    }
    catch (err) {
        return ret.err500(err);
    }
}





