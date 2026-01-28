const nodemailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');

// Helpers
const { dd, ddm, empty } = require('../../helpers/helpers');
const Media = require('../Media/Media');


//---------------------------------------------------------------------------------------------

/*
const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
        // service: process.env.SMTP_SERVICE,   // SERVICE or HOST
        host: process.env.SMTP_SERVICE,
        // secure: false,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.USER_NAME,
            pass: process.env.USER_PASSWORD
        }
    });
    transporter.sendMail({
        to: 'kp99@mailinator.com',
        from: 'qoz@mailinator.com',
        subject: 'Woking!',
        html: `helllo`

    }).then((error, info) => {

        dd('PENDING MAIL RESPONSE - ' + 'templateName');
        return true;
    }).catch(e => dd(e));
* */

const transporter = nodemailer.createTransport({
    // service: process.env.SMTP_SERVICE,   // SERVICE or HOST
    host: process.env.SMTP_SERVICE,
    secure: false,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.USER_NAME,
        pass: process.env.USER_PASSWORD
    }
});


// Send Mail Template
exports.sendMailTemplate = async (templateName, payload) => {
    return new Promise((resolve, reject) => {
        try {
            if (empty(payload.toEmail)) {
                dd('MAIL NOT FIRED TO EMPTY - (' + payload.toEmail + ')');
                return resolve(false);
            }

            //dd('MAIL FIRED - (' + payload.toEmail + ') [' + templateName + ']');


            payload.config = {
                appName: process.env.APP_NAME,
                supportEmail: process.env.ADMIN_EMAIL,

                logoImg: Media.getEmailImage('logo.png'),


                //------------------

                bannerImg: Media.getEmailImage('email-banner.png'),

            };

            payload.viewTemplateName = templateName;

            ejs.renderFile(__dirname + '/../../views/email/includes/layout.ejs', payload, async (err, htmlData) => {
                if (err) {
                    dd(err);
                    return resolve(false);
                }
                transporter.sendMail({
                    to: payload.toEmail,
                    from: process.env.MAIL_FROM,
                    subject: payload.subject,
                    html: htmlData,
                    attachments: payload?.attachments || []
                }).then((error, info) => {
                    // ddm('PENDING MAIL RESPONSE - (' + payload.toEmail + ') [' + templateName + ']');
                    // ddm(info, 'info')
                    // ddm(error, 'error')
                    resolve(!empty(info));

                }).catch(e => {
                    ddm(e);
                    resolve(false);
                });

            });
        } catch (e) {
            dd(e);
            resolve(false);
        }
    });
};

