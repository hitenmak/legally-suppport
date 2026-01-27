const express = require('express');
const router = express.Router();


//----------------------------------------------
const {d, dd} = require('../helpers/helpers');
// const DatabaseSeeder = require('../models/seeders/databaseSeeder');
// const RunCron = require('../models/seeders/runCron');
// const AddExtraSwapCoin = require('../migration/addExtraSwapCoin');
// const FullStakeRewardIfx = require('../migration/fullStakeRewardIfx');
//----------------------------------------------

//----------------------------------------------
// Route Config {
router.all('*', (req, res, next) => {
    res.ret.viewPrefix = '';
    next();
});
// } Route Config
//----------------------------------------------

// router.get('/seed/:isTruncate/:seederName', DatabaseSeeder.index);
//
// router.post('/run-cron/:addDays', RunCron.index);
// router.get('/migrate/swap-extra',  AddExtraSwapCoin.index);
// router.get('/migrate/full-stake-reward-ifx',  FullStakeRewardIfx.index);
// router.get('/migrate', );
// router.get('/run-cron', RunCron.updateDb);
// router.get('/migrate', DatabaseMigration.index);
// router.get('/error-logs', ErrorLogs.index);



module.exports = router;
