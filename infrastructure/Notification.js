require('dotenv').config();

// Helpers
const {dd, ddm, empty, makeList, getDateFormat, d, shortDescription} = require('../helpers/helpers');

// const PushNotification = require('./PushNotification/Send');
// const ListNotification = require('./ListNotification/Store');
const Mail = require('./Mail/Mail');

//---------------------------------------------------------------------------------------------
// Make Token List Helper


exports.miningNotification = async(payload) => {
    payload.title = `${payload.fromUsername} wants you to stake!`;
    payload.body = `You haven't staked for long time, ${payload.fromUsername} requesting you to stake immediately.`;
    payload.type = 'MINING';
    // await PushNotification.commonNotification({...payload});
    // await ListNotification.commonNotification({...payload});
}


exports.cappingNotification = async(payload) => {
    payload.title = `Your daily income is being capped due to low staking`;
    payload.body = `Please stake more coins to unlock full rewards`;
    // payload.body = `Please stake for more to unlock full rewards.`;
    payload.type = 'CAPPING';
    // await PushNotification.commonNotification({...payload});
    // await ListNotification.commonNotification({...payload});
}


exports.withdrawRequestCreated = async(payload) => {
    payload.toEmail = payload?.user?.email;
    await Mail.sendWithdrawRequestCreate(payload);
}

exports.withdrawRequestUsdtCreated = async(payload) => {
    payload.toEmail = payload?.user?.email;
    await Mail.sendWithdrawRequestUsdtCreate(payload);
}

exports.broadcastNotification = async(payload, isAllDevices = true) => {
    payload.type = 'BROADCAST';
    // d(isAllDevices, 'isAllDevices');
    // d(payload, 'payload');
    // await PushNotification.commonNotification({...payload}, isAllDevices);
    // await ListNotification.commonNotification({...payload});
}


exports.supportTicketReplay = async(payload) => {

    const ticketDetails = payload.record || {};
    const userDetails = payload.user || {};
    payload.title = `New replies from the support ticket - ${ticketDetails.ticketId}`;

    if(empty(ticketDetails.reply)) {
        payload.body = `You have received new replies from the support ticket - ${ticketDetails.ticketId}`;
    } else {
        let replay = ticketDetails.reply[ticketDetails.reply.length-1];
        payload.body = shortDescription(replay.message, 125);
    }

    payload.toFcmTokens = userDetails.notificationToken;
    payload.toUserId = userDetails._id;
    payload.type = 'SUPPORT-TICKET';
    payload._target = {
        ...(payload._target || {}),
        key: 'SUPPORT-TICKET-DETAILS',
        id: ticketDetails._id,
        ticketId: ticketDetails.ticketId,
        isOpen: ticketDetails.isOpen,
    }

    delete payload.user;
    delete payload.record;

    // d(payload, 'payload');
    // await PushNotification.commonNotification({...payload});
    // await ListNotification.commonNotification({...payload});
}