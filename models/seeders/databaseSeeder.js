require('dotenv').config();

// Models
const Admin = require('../Admin');
const Config = require('../Config');
const IfcTradePrice = require('../IfcTradePrice');
const DirectReferralIncome = require('../DirectReferralIncome');
const SupportTicket = require('../SupportTicket');
const Stake = require('../Stake');
const User = require('../User');
const WalletHistory = require('../WalletHistory');
const WalletTransfer = require('../WalletTransfer');
const WithdrawRequest = require('../WithdrawRequest');
const DailyIncome = require('../DailyIncome');
const LevelIncome = require('../LevelIncome');
const BonusIncome = require('../BonusIncome');
const LaTokenIfcTradePrice = require('../LaTokenIfcTradePrice');

// Helpers
const { dd, empty, getValue } = require('../../helpers/helpers');
const { makeHashPassword } = require('../../helpers/auth');
const DataSets = require('./dataSets');
const MediaPost = require('../MediaPost');
const CoinOffer = require('../CoinOffer');
const AppSetting = require('../AppSetting');
const WithdrawSettings = require('../WithdrawSettings');

//---------------------------------------------------------------------------------------------

// Level X -------------------------------------------------------------------------------------------------

// X ✔
const adminSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await Admin.deleteMany({});

    Admin.insertMany(DataSets.admins());

    let oldRecords = await Admin.find();
    return { new: oldRecords, all: oldRecords };

};

const configSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await Config.deleteMany({});

    Config.insertMany(DataSets.configs());

    let oldRecords = await Config.find().exec();
    return { new: oldRecords, all: oldRecords };

};

const ifcTradePriceSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await IfcTradePrice.deleteMany({});

    IfcTradePrice.insertMany(DataSets.ifcTradePrice());

    let oldRecords = await IfcTradePrice.find().exec();
    return { new: oldRecords, all: oldRecords };

};


// Level 0 -------------------------------------------------------------------------------------------------

// Users
const userSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await User.deleteMany({});

    User.insertMany(DataSets.users());

    let oldRecords = await User.find();
    return { new: oldRecords, all: oldRecords };

};


// Level 1 -------------------------------------------------------------------------------------------------
// Stake
const stakeSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await Stake.deleteMany({});


    Stake.insertMany(DataSets.stake());

    let oldRecords = await Stake.find();
    return { new: oldRecords, all: oldRecords };

};


// Bonus Income
const bonusIncomeSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await BonusIncome.deleteMany({});


    BonusIncome.insertMany(DataSets.bonusIncome());

    let oldRecords = await BonusIncome.find();
    return { new: oldRecords, all: oldRecords };

};

// Support Ticket
const supportTicketSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;
    if (isTruncate) await SupportTicket.deleteMany({});
    SupportTicket.insertMany(DataSets.supportTicket());
    let oldRecords = await SupportTicket.find();
    return { new: oldRecords, all: oldRecords };
}


// Support Ticket
const mediaPostSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;
    if (isTruncate) await MediaPost.deleteMany({});
    MediaPost.insertMany(DataSets.mediaPost());
    let oldRecords = await MediaPost.find();
    return { new: oldRecords, all: oldRecords };
}

// Wallet History
const walletHistorySeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await WalletHistory.deleteMany({});


    WalletHistory.insertMany(DataSets.walletHistory());

    let oldRecords = await WalletHistory.find();
    return { new: oldRecords, all: oldRecords };

};

// Direct Refferal
const directReferralSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;
    if (isTruncate) await DirectReferralIncome.deleteMany({});
    DirectReferralIncome.insertMany(DataSets.directReferralIncome());
    let oldRecords = await DirectReferralIncome.find();
    return { new: oldRecords, all: oldRecords };
}

// Level 3 -------------------------------------------------------------------------------------------------

// Level Income
const levelIncomeSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await LevelIncome.deleteMany({});


    LevelIncome.insertMany(DataSets.dailyIncome());

    let oldRecords = await LevelIncome.find();
    return { new: oldRecords, all: oldRecords };

};

// Daily Income
const dailyIncomeSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await DailyIncome.deleteMany({});


    DailyIncome.insertMany(DataSets.dailyIncome());

    let oldRecords = await DailyIncome.find();
    return { new: oldRecords, all: oldRecords };

};


// Withdraw Request
const withdrawRequestSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await WithdrawRequest.deleteMany({});


    WithdrawRequest.insertMany(DataSets.withdrawRequest());

    let oldRecords = await WithdrawRequest.find();
    return { new: oldRecords, all: oldRecords };

};

const coinOfferSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await CoinOffer.deleteMany({});


    CoinOffer.insertMany(DataSets.coinOffer());

    let oldRecords = await CoinOffer.find();
    return { new: oldRecords, all: oldRecords };
}

const withdrawSettingsSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await WithdrawSettings.deleteMany({});


    WithdrawSettings.insertMany(DataSets.withdrawSettings());

    let oldRecords = await WithdrawSettings.find();
    return { new: oldRecords, all: oldRecords };
}

const appSettingSeeder = async (req, res) => {
    ret = res.ret;
    isTruncate = req.params.isTruncate;

    if (isTruncate) await AppSetting.deleteMany({});

    AppSetting.insertMany(DataSets.appSetting());

    let oldRecords = await AppSetting.find();
    return { new: oldRecords, all: oldRecords };
}

// Clear -------------------------------------------------------------------------------------------------
const clear = async (req, res) => {

    let ret = res.ret;

    await Admin.deleteMany({});
    await Config.deleteMany({});
    await DirectReferralIncome.deleteMany({});
    await SupportTicket.deleteMany({});
    await Stake.deleteMany({});
    await User.deleteMany({});
    await WalletHistory.deleteMany({});
    await WalletTransfer.deleteMany({});
    await WithdrawRequest.deleteMany({});
    await DailyIncome.deleteMany({});
    await BonusIncome.deleteMany({});
    await WithdrawRequest.deleteMany({});
    await AppSetting.deleteMany({});
    await IfcTradePrice.deleteMany({});
    await WithdrawSettings.deleteMany({});


    return 'Table clear successfully';
};

const all = async (req, res) => {

    let ret = res.ret;

    isTruncate = req.params.isTruncate;

    if (isTruncate) await clear(req, res);

    await adminSeeder(req, res);
    await configSeeder(req, res);
    await ifcTradePriceSeeder(req, res);
    // await userSeeder(req, res);
    // await stakeSeeder(req, res);
    // await dailyIncomeSeeder(req, res)
    // await levelIncomeSeeder(req, res);
    // await walletHistorySeeder(req, res);
    // await bonusIncomeSeeder(req, res);
    // await supportTicketSeeder(req, res);
    await mediaPostSeeder(req, res);
    // await directReferralSeeder(req, res);
    // await withdrawRequestSeeder(req, res);
    await appSettingSeeder(req, res);
    await coinOfferSeeder(req, res);
    await withdrawSettingsSeeder(req,res);
    return 'Table seeding all successfully';
};

const onlySettings = async (req, res) => {

    let ret = res.ret;

    isTruncate = req.params.isTruncate;

    // if (isTruncate) {
    //     await Admin.deleteMany({});
    //     await Admin.deleteMany({});
    //     await Admin.deleteMany({});
    //     await Admin.deleteMany({});
    //     await Admin.deleteMany({});
    // }

    await adminSeeder(req, res);
    await configSeeder(req, res);
    // await userSeeder(req, res);
    // await stakeSeeder(req, res);
    // await dailyIncomeSeeder(req, res)
    // await levelIncomeSeeder(req, res);
    // await walletHistorySeeder(req, res);
    // await bonusIncomeSeeder(req, res);
    // await supportTicketSeeder(req, res);
    await mediaPostSeeder(req, res);
    // await directReferralSeeder(req, res);
    // await withdrawRequestSeeder(req, res);
    await appSettingSeeder(req, res);
    await coinOfferSeeder(req, res);
    return 'Table seeding all successfully';
};

//-------------------------------------------------------------------------------------------------
// Index listing View
//-------------------------------------------------------------------------------------------------
exports.index = async (req, res) => {

    let ret = res.ret;
    seederName = req.params.seederName;

    const seederType = [
        'admin',
        'config',
        'user',
        'stake',
        'levelIncome',
        'walletHistory',
        'bonusIncome',
        'supportTicket',
        'mediaPost',
        'dailyIncome',
        'levelIncome',
        'directReferral',
        'withdrawRequest',
        'appSetting',
        'ifcTradePrice',
        'withdrawSettings',
        // 'coinOffer',
    ];

    if (seederName === 'clear') {
        clear(req, res);
        return ret.send(true, {}, 'Table clear successfully');
    }
    if (seederName === 'all') {
        all(req, res);
        return ret.send(true, {}, 'Table seeding all successfully');
    }
    if (seederName === 'onlySettings') {
        onlySettings(req, res);
        return ret.send(true, {}, 'Table seeding all successfully');
    }

    if (!seederType.includes(seederName)) return ret.send(false, seederType, 'Invalid Seeding');
    seederName = seederName + 'Seeder';
    const data = await eval(seederName)(req, res);
    return ret.send(true, data, 'Seeding successfully');


};

