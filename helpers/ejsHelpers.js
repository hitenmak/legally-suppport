exports = module.exports = {};

// Get Full Url
exports.getFullUrl = (name = '') => {
    return process.env.APP_URL + '/fw2ezuyzb751/' + name;
};
// Get Full Url
exports.getFullUrlAction = (name = '') => {
    return process.env.APP_URL + '/fw2ezuyzb751/' + name;
};

// Empty
exports.empty = (data) => {
    if ([undefined, 'undefined', null, 'null', ''].includes(data) || typeof data === 'object' && Object.keys(data).length === 0)
        return true;
    return typeof data === 'string' && !data.trim().length;

};