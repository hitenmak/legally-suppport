
// Helpers
const { d, dd} = require('../../helpers/helpers');

//---------------------------------------------------------------------------------------------


// Add Edit Form
exports.index = async (req, res) => {
    let errorCode = req.params.errorCode.toString();
    if(!['403', '500'].includes(errorCode)) errorCode = '403';
    res.ret.render('errors/' + errorCode, {},null, true);
};
