const moment = require('moment');

// Models
const User = require('../../models/User');
const SupportTicket = require('../../models/SupportTicket');

// Helpers
const { d, dd, empty, formatNumber, getDateFormat, timeSince, getFixedDecimal} = require('../../helpers/helpers');
const { getFullUrlAction } = require('../../helpers/ejsHelpers');
const Constant = require('../../config/Constant');


//---------------------------------------------------------------------------------------------


// Index View
exports.index = async (req, res) => {
    const ret = res.ret;


    //-----------------------------

    // Today
    const todayStart = new Date(moment().startOf('day'));
    const todayEnd = new Date(moment().endOf('day'));

    // Yesterday
    const yesterdayStart = new Date(moment().subtract(1, 'day').startOf('day'));
    const yesterdayEnd = new Date(moment().subtract(1, 'day').endOf('day'));

    // This week
    const thisWeekStart = new Date(moment().startOf('week'));
    const thisWeekEnd = new Date(moment().endOf('week'));

    // Last week
    const lastWeekStart = new Date(moment().subtract(1, 'week').startOf('week'));
    const lastWeekEnd = new Date(moment().subtract(1, 'week').endOf('week'));

    // This month
    const thisMonthStart = new Date(moment().startOf('month'));
    const thisMonthEnd = new Date(moment().endOf('month'));

    // Last month
    const lastMonthStart = new Date(moment().subtract(1, 'month').startOf('month'));
    const lastMonthEnd = new Date(moment().subtract(1, 'month').endOf('month'));

    d([{ $gte: todayStart, $lte: todayEnd },
{ $gte: yesterdayStart, $lte: yesterdayEnd },
{ $gte: thisWeekStart, $lte: thisWeekEnd },
{ $gte: lastWeekStart, $lte: lastWeekEnd },
{ $gte: thisMonthStart, $lte: thisMonthEnd },
{ $gte: lastMonthStart, $lte: lastMonthEnd }
    ])

    ret.render('dashboard/index', {});
};






