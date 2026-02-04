const moment = require('moment');

// Models
const User = require('../../models/User');
const SupportTicket = require('../../models/SupportTicket');

// Helpers
const { d, dd, empty, formatNumber, getDateFormat, timeSince, getFixedDecimal, formatDuration } = require('../../helpers/helpers');
const { getFullUrlAction } = require('../../helpers/ejsHelpers');
const Constant = require('../../config/Constant');
const Notification = require('../../models/Notification');
const Admin = require('../../models/Admin');


//---------------------------------------------------------------------------------------------


// Index View
exports.index = async (req, res) => {
    const ret = res.ret;

    const adminId = req?.user?._id;
    if (!adminId) return res.ret.redirect('login');
    // const admin = await Admin.findOne({ _id: adminId });
    let admin = {};
    const adminRes = await Admin.aggregate([
        {
            $match: {
                _id: adminId
            }
        },
        {
            $lookup: {
                from: "supporttickets",
                localField: "_id",
                foreignField: "acceptedBy",
                as: "tickets"
            }
        },
        {
            $addFields: {
                count: { $size: "$tickets" },
                avgAcceptTime: {
                    $avg: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$tickets",
                                    as: "t",
                                    cond: {
                                        $ne: ["$$t.acceptedAt", null]
                                    }
                                }
                            },
                            as: "t",
                            in: {
                                $abs: {
                                    $dateDiff: {
                                        startDate: "$$t.createdAt",
                                        endDate: "$$t.acceptedAt",
                                        unit: "millisecond"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$tickets"
        },
        {
            $match: {
                $or: [
                    { tickets: null },
                    { "tickets.isDeleted": false }
                ]
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                count: 1,
                avgAcceptTime: 1,

                userReplyTime: {
                    $min: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$tickets.reply",
                                    as: "r",
                                    cond: {
                                        $eq: ["$$r.adminId", null]
                                    }
                                }
                            },
                            as: "ur",
                            in: "$$ur.createdAt"
                        }
                    }
                },
                adminReplyTime: {
                    $min: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$tickets.reply",
                                    as: "r",
                                    cond: {
                                        $eq: [
                                            "$$r.adminId",
                                            adminId
                                        ]
                                    }
                                }
                            },
                            as: "ar",
                            in: "$$ar.createdAt"
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                replyTimeMs: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ["$userReplyTime", null] },
                                { $ne: ["$adminReplyTime", null] }
                            ]
                        },
                        then: { $subtract: ["$adminReplyTime", "$userReplyTime"] },
                        else: null
                    }
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                email: { $first: "$email" },
                count: { $first: "$count" },
                isActive: { $first: "$isActive" },
                avgAcceptTime: { $first: "$avgAcceptTime" },
                avgResTime: { $avg: "$replyTimeMs" }
            }
        }
    ]);
    if (adminRes && adminRes.length > 0) {
        admin = adminRes[0];

        admin.tickets = admin?.count || 0;
        admin.avgAcceptTime = formatDuration(admin?.avgAcceptTime);
        admin.avgResTime = formatDuration(admin?.avgResTime);
    }

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

    ret.render('dashboard/index', { admin });
};






