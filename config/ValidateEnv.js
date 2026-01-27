const chalk = require('../helpers/chalk');
const { dd, empty } = require('../helpers/helpers');

module.exports = () => {
    let isError = false;
    try {
        const envKeys = [
            'APP_NAME',
            'APP_SECRET_KEY',
            'APP_URL',
            'APP_MODE',
            'PORT',
            'CONNECTION_STRING',
            'JWT_SECRET_KEY',
            'JWT_EXPIRATION',
            'JWT_REFRESH_SECRET_KEY',
            'JWT_REFRESH_EXPIRATION',
            'AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE',
            'AWS_S3_SECRET_KEY',
            'AWS_S3_ACCESS_KEY_ID',
            'AWS_S3_REGION',
            'AWS_S3_BUCKET_BASE_URL',
            'AWS_S3_BUCKET_NAME',
            'SMTP_PORT',
            'USER_NAME',
            'USER_PASSWORD',
            'SMTP_SERVICE',
            'MAIL_FROM',
            'ADMIN_EMAIL',
            'MAIL_ENCRYPTION',
            'BASIC_API_TOKEN',
            'TZ',
        ];

        envKeys.forEach(k => {
            if (empty(process.env[k])) {
                isError = true;
                chalk.printBlink(`ENV - variables not defined - Error: ${k}`,
                    'FgRed');
            }
        });
        if (isError)
            process.exit(0);
        chalk.printBlink(`ENV - variables satisfied`, 'FgBlue');
    } catch (err) {
        dd(err);
    }
};