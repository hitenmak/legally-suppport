require('dotenv').config();
const moment = require('moment');
const path = require('path');

// const getDate = (days) => moment().add(days, 'days');
// -------------------------------------------------------------------------------------------------

const ticketRequestType = {
    OTHERS: 'Others',
      ACCOUNT: 'Account',
    COMPLAINT: 'Complaint'
}


module.exports = {
    ROOT_DIR: path.join(process.cwd(), 'public'),

    STORAGE: {
        IS_LOCAL: true,
        LOCAL_FOLDER: 'public/storage',
        MAX_FILE_SIZE_MB: 50,
    },

    
    ticketRequestType,
    ticketRequestTypeKeys: Object.keys(ticketRequestType),

}