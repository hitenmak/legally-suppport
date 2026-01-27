exports = module.exports = {};

exports.isActiveItem = (routeName = '') => {return ServiceConfig.activeRoute.includes(routeName) ? 'active' : '';};

exports.getFullUrl = (name = '') => {return process.env.APP_URL + '/fw2ezuyzb751/' + name;};