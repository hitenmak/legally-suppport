/*
const { MongoClient, ObjectId } = require('mongodb');


// const url = 'mongodb://0.0.0.0:27017'; // MongoDB connection URL
const url = 'mongodb://mongodb.ifortune.local:27017'; // MongoDB connection URL
const dbName = 'ifortune_live_2024'; // Database name
const client = new MongoClient(url);
const db = client.db(dbName);

// ----------------------------------------------------------
const d = (data, flag = null) => {
    console.log('>-----------------------------------------------------------');
    if (flag) console.log('<-- ' + flag + ' -->');
    console.log(data);
};

const makeList = (record, keyName = '_id', isConvertString = true) => {
    try {

        if (!record) return [];
        let newIds = [];
        record.forEach(r => {
            newIds.push(isConvertString ? r[keyName].toString() : r[keyName]);
        });
        return newIds;
    } catch (e) {
        d(record);
        d(e);
    }
};

// ----------------------------------------------------------





// ----------------------------------------------------------
d(`Project Start ${new Date()}`);

let User;
let DailyIncome;

// ----------------------------------------------------------



// ----------------------------------------------------------
const initDatabase = async () => {

    // models {
    await client.connect();
    User = db.collection('users');
    DailyIncome = db.collection('dailyincomes');
    Stake = db.collection('stakes');
    // } models

}
// ----------------------------------------------------------





(async () => {

    await initDatabase();


    // ----------------------------------------------------------



    const inactiveDate = '2024-06-01T18:29:59.999Z';
    // const inactiveDateUpto = '2024-04-01T18:29:59.999Z';

    // active dailyIncome filters {
    // const dailyIncomeUsers = await DailyIncome.aggregate([
    //     // {$match: {date: new Date(inactiveDate)}},
    //     {$match: {date: {$gte: new Date(inactiveDate)}}},
    //     {$group: {_id: '$userId', total: {$sum: 1}}},
    //     // {$match: {total: { $gte: 10 }}}
    // ]).toArray();
    //
    // const dailyIncomeUserIds = makeList(dailyIncomeUsers, '_id', true);
    // // } active withdraw filters
    //
    // const activeUserIds = dailyIncomeUserIds.map(id => new ObjectId(id));

    // const lastActiveUsers = await User.find({
    //     // rewardWallet: {$gt: 0}
    //     // lastActiveHistory: {$elemMatch: {$gte: new Date('2024-01-01T18:29:59')}},
    //     lastActiveDate: {$gte: new Date(inactiveDate)},
    // }).toArray();

    // const activeUserIds = lastActiveUsers.map(u => new ObjectId(u._id));

    // d(lastActiveUsers);
    // return false;

    // users {
    // const activeUsers = await User.find({
    //     _id: {$in: activeUserIds}
    // }).toArray();
    // const inActiveUsers = await User.find({
    //     _id: {$nin: activeUserIds}
    // }).toArray();
    // } users


    // stakes {
    // const stakeWithIfc = await Stake.aggregate([
    //     {$match: {
    //         isStakeComplete: false,
    //         isWithoutIfcPrice: false,
    //         userId: {$nin: activeUserIds},
    //     }},
    //     {$project: {result: {$divide: ['$ROILimitVar', '$ifcPrice']}}},
    //     {$group: {_id: null, resultNoIfc: {$sum: '$result'},}}
    // ]).toArray();
    //
    // const stakeWithoutIfc = await Stake.aggregate([
    //     {$match: {
    //         isStakeComplete: false,
    //         isWithoutIfcPrice: true,
    //         userId: {$nin: activeUserIds},
    //     }},
    //     {$group: {_id: null, total: {$sum: '$ROILimitVar'}}}
    // ]).toArray();
    // } stakes

    d(stakeWithIfc, 'stakeWithIfc');
    d(stakeWithoutIfc, 'stakeWithoutIfc');


    const data = {
        // dailyIncomeUsers: dailyIncomeUserIds.length,
        // activeUsersIds: activeUserIds.length,
        // activeUsers: activeUsers.length,
        // inActiveUsers: inActiveUsers.length,
    };
    d(data, 'data');



    process.exit();



    // ----------------------------------------------------------
})()

*/
