const { sendMailTemplate } = require('./MailMethods');

// Send Otp Mail
exports.sendOtpMail = async (payload) => {
    return new Promise(async (resolve, reject) => {
        payload.subject = process.env.APP_NAME + ' - Your verification OTP code for ' + process.env.APP_NAME;
        resolve(await sendMailTemplate('otp', payload));
    });
};

// Send Admin Create
exports.sendAdminCreate = async (payload) => {
    return new Promise(async (resolve, reject) => {
        payload.subject = process.env.APP_NAME + ` - Congratulations! Your ${process.env.APP_NAME} admin account is ready to access.`;
        resolve(await sendMailTemplate('admin-profile-create', payload));
    });
};

exports.supportTicketCreate = async (payload) => {
    return new Promise(async (resolve, reject) => {
        payload.subject = process.env.APP_NAME + ` - New support ticket has been created.`;
        // payload.toEmail = payload?.user?.email;
        resolve(await sendMailTemplate('support-ticket', payload));
    });
};

exports.supportTicketReply = async (payload) => {
    return new Promise(async (resolve, reject) => {
        payload.subject = process.env.APP_NAME + ` - You just got a new reply for support ticket ${payload.ticketId}.`;
        // payload.toEmail = payload?.user?.email;
        resolve(await sendMailTemplate('support-ticket', payload));
    });
};
