const chalk = require('../helpers/chalk');
const moment = require('moment');


const LogInvalidUrl = require('../models/LogInvalidUrl');


//----------------------------------------------


//----------------------------------------------
class Log
{

    constructor(req, tag = null) {
        this.req = req;
        this.tag = tag;
        this.addLog(this.req, this.tag);

    }

    getDateFormat = (date, format = 'D MMM YY') => {return moment(date, 'YYYY-MM-DDTHH:mm:ss.SSS').format(format)};

    addLog = (req, tag) => {
        try {
           // const reqData = req || this.req;
            if(['/'].includes(req?.originalUrl)) return true;
           const record = new LogInvalidUrl;

           record.tag = tag;
           record.url = req?.originalUrl;
           record.headers = req?.headers;
           // record.details = JSON.stringify(req);
           record.save();

           chalk.printBright(`LOG-INVALID: ${record.tag} - ${this.getDateFormat(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSS')}`, 'FgRed');


        } catch (e) {
           chalk.printBright(e, 'FgRed');

        }

    };


}

module.exports = Log;