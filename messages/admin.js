// const WithdrawRequest = require('../models/WithdrawRequest');

module.exports = {

    common: {
        saved: 'Record saved successfully.',
        delete: 'Record deleted successfully.',
        notFound: 'Record not found.',
        found: 'Record not found.',
        reportGenerated: 'Report generated',
    },
    config: {
        notFound: 'Configuration not found.',
        detailsFound: 'Configuration details found.',
        saved: 'Config saved successfully.',

    },

    userProfile: {
        enable2fa: '2FA authentication enabled.',
        disable2fa: '2FA authentication disabled.',
        enableUser: "User enabled",
        disableUser: "User disabled",
        recover: 'User is recovered',
        detailsUpdated: 'User details upgraded successfully.',
    },

    // Auth
    auth: {
        credentialNotMatch: 'Your username and password do not match.',
        logout: 'Your have been successfully logged out.',
        accountNotAccess: 'You are not allowed to access your account.',
        emailAlreadyExist: 'Email already exist.',
        phoneAlreadyExist: 'Phone already exist.',
        emailValidExist: 'Email is valid.',
        dependencyIssue: 'Something went wrong'
    },

    withdrawal: {
        approval: 'Request approved',
        reject: 'Request rejected'
    },

    gift: {
        approval: 'Marked as gift rewarded',
        statusUpdated: 'Status updated',
    },

    offer: {
        saved: 'Saved'
    },

    profile: {
        deactivate: 'Deactivate',
        deactivated: 'Deactivated'
    },

    rewardCampaign: {
        approved: 'Approved',
        rejected: 'Rejected',
        processed: 'Already processed, multiple request not allowed'
    },

    exchangeOwnership: {
        confirmed: 'Confirmed',
        rejected: 'Rejected',
        processed: 'Already processed, multiple request not allowed'
    },

    notification: {
        send: 'Notification send successfully',
    },


    supportTicket: {
        create: 'Ticket created successfully',
         accept: {
            success: 'Support ticket accepted',
            fail: 'failed to accept the ticket',
            alreadyAccepted: 'Support ticket already accepted',
            alreadyAcceptedByOther: 'Support ticket already accepted by another admin',
        }
    },
    // Values ---------------------------------------------------------------------------------------------


};

