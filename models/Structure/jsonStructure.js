exports = module.exports = {};

exports.jsonStructure = {
    type: String,
    default: null,
    get: (data) => {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    },
    set: (data) => {
        return JSON.stringify(data);
    }
};