const { dd, empty, makeIdList } = require('../helpers/helpers');

class SubDocument
{
    constructor(model) {
        this.model = model || [];
    }


    // Helper
    searchHelper(value = '', key = '', isDataTypeCheck = false, isOne = false) {
        let filteredRow = [];
        this.model.forEach((r, index) => {
            let isValidValue = (isDataTypeCheck ? r[key] : (r[key] ? r[key].toString() : '')) === (isDataTypeCheck ? value : (value ? value.toString() : ''));
            if (isValidValue) {
                filteredRow.push(r);
            }
        });

        return !empty(filteredRow) ? (isOne ? filteredRow[0] : filteredRow) : (isOne ? null : []);
    }


    new(record) {
        this.model.push(record);
        return record;
    }


    findOne(filter, isDataTypeCheck = false) {
        let key = Object.keys(filter)[0];
        return this.searchHelper(filter[key], key, isDataTypeCheck, true);
    }


    find(filter, isDataTypeCheck = false) {
        let key = Object.keys(filter)[0];
        return this.searchHelper(filter[key], key, isDataTypeCheck);
    }


    save(row) {
        // this.findOne({ '_id': row._id });
        let isSaved = false;
        this.model.forEach((r, index) => {
            if (r._id.toString() === row._id.toString()) {
                this.model[index] = row;
                isSaved = true;
            }
        });
        return isSaved;
    }


    create(row) {
        if (!empty(row._id) && !empty(this.findOne({ '_id': row._id })))
            return this.save(row);
        else
            return this.new(row);
    }

    setValues(dataArray, keyPairs) {
        if (empty(dataArray)) return this.closed();
        dataArray.forEach(r => {
            const rowSingle = {};
            for (const keys in keyPairs) {
                let dataKey = keys.split(':');
                let value = r[dataKey[1]];
                if (!empty(keyPairs[keys])) value = keyPairs[keys](value);
                rowSingle[dataKey[0]] = value;

            }
            this.new(rowSingle);
        });
        return this.closed();

    }

    remove(rows, matchKey = '_id') {
        if (!Array.isArray(rows)) rows = [rows];
        const deleteIds = makeIdList(rows, '_id');
        let newModel = [];
        let removeCount = 0;
        this.model.forEach(r => {
            if (!deleteIds.includes(r[matchKey].toString())) {
                newModel.push(r);
                removeCount += 1;
            }
        });
        this.model = newModel;
        return this.model;
    }


    closed() {
        return this.model;
    }


}

module.exports = SubDocument;