const mongoose = require("mongoose");
const moment = require('moment');
const { d, empty } = require('../helpers/helpers');
const chalk = require('../helpers/chalk');
// const DataManipulate = require('../helpers/dataManipulate');
// const CommonConfig = require('../models/CommonConfig');
const User = require('../models/User');
// const dailyCountLessRewardtNetworkStat = require('../jobs/dailyCountLessRewardtNetworkStat');
const { makeHashPassword } = require('../helpers/auth');
const Admin = require('./../models/Admin')
// const performanceMeter = require('../jobs/performanceMeter');

//----------------------------------------------

//----------------------------------------------

// (async () => {
//
// })();


module.exports = async () => {
    /*mongoose.set('debug', function(collectionName, method, query, doc) {
        console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
    });*/

    chalk.printLog('CONSTRUCT - app data init ', 'FgBlue');

    // Insert Admin { ------------------------------------------

    /* let { hash, salt } = makeHashPassword('123456');
        // let ifortune = makeHashPassword('ifortune');
        let main = makeHashPassword('123456');


        Admin.insertMany([
            { _id: '6380bb855673dc4b8d0602dd', name: 'Hello', email: 'hello@mailinator.com', isMaster: true, hash: hash, salt: salt },
            // { _id: '642d0a040d378f22a805aad7', name: 'Hello', email: 'admin@ifortune.com', isMaster: true, hash: ifortune.hash, salt: ifortune.salt },
            // { _id: '642d0a040d378f22a805aad8', name: 'iFortune Admin', email: 'rrpmachinee', isMaster: true, hash: main.hash, salt: main.salt },
        ]); */

    // } Insert Admin ------------------------------------------


    
    // Insert User { ------------------------------------------

    /* let { hash, salt } = makeHashPassword('123456');
        User.insertMany([
            {
                _id: '64393a92a27b0f4473019416',
                createdAt: '2023-04-19T10:45:12.649Z',
                email: 'kp123@mailinator.com',
                hash: hash,
                salt: salt,
                phone: '8140179137',
                name: 'kp123',
                username: 'kp123',
            },
        ]) */

    // } Insert User ------------------------------------------


    // performanceMeter()
    // direct run cron {
    /*const days = 8;

    const addDays = moment().add(days, 'days');

    d(new Date(addDays))
    await User.updateMany({isIfxActive: true},
        {$set: {ifxLastActiveDate: new Date(addDays)}, $push: {ifxLastActiveHistory: {$each: [new Date(addDays)], $slice: -30}},},
        {returnDocument: 'after'},
    ).exec()

    await require('../jobs/ifx-cron/ifxDailyIncome')(addDays);
    await require('../jobs/ifx-cron/ifxLevelIncome')(addDays);*/
    // } direct run cron
    // dd(makeHashPassword(''));

    /* await Promise.all([
        DataManipulate.setCatchStakeConfig(),
        DataManipulate.setNetworkStatCache(),
        DataManipulate.setNetworkStatCacheIfx(),
    ]);

    let statsManagementProperties = await CommonConfig.findOne({key: 'stats-management'});
    if(empty(statsManagementProperties) || empty(statsManagementProperties?.data)){
        dailyCountLessRewardtNetworkStat();
    } */

};


