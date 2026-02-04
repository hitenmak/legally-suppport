const v8 = require('v8');
const mongoose = require('mongoose');
const moment = require('moment');
const qr = require('qr-image-color');
const request = require('request').defaults({ encoding: null });

// Helpers
const chalk = require('./chalk');
const Constant = require('../config/Constant');


//---------------------------------------------------------------------------------------------
const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//---------------------------------------------------------------------------------------------


const ddSuper = (data, flag = null) => {
    chalk.printDim('>-----------------------------------------------------------', 'FgWhite');
    if (flag) chalk.printUnderscore('<-- ' + flag + ' -->', 'FgCyan');
    chalk.printLog(data);
};
// exports.dd = dd;

// Dd
const dd = (data, flag = null) => {
    ddSuper(data, flag);

};
exports.dd = dd;


// D
const d = (data, flag = null) => {
    dd(data, flag);
};
exports.d = d;


// De
const de = (data, flag = 'Catch Error :(') => {
    ddSuper(data, flag);
};
exports.de = de;

// ddm
const ddm = (data, flag = null) => {
    ddSuper(data, flag);
};
exports.ddm = ddm;


// ddl
const ddl = (data, flag = null) => {
    if (flag) console.log('<-- ' + flag + ' -->');
    console.log(data);
};
exports.ddl = ddl;

// ex
const ex = (data = '', flag = null) => {
    dd(data, flag);
    dd('Exit From Code :)');
    throw new Error('Exit from code happily :)');
};
exports.ex = ex;


// Value - helpers { ---------------------------------
// Empty
const empty = (data) => {
    if ([undefined, 'undefined', null, 'null', ''].includes(data) || typeof data === 'object' && Object.keys(data).length === 0)
        return true;
    return typeof data === 'string' && !data.trim().length;

};
exports.empty = empty;


// Make Value
const makeValue = (data) => {
    return [undefined, 'undefined', null, 'null', ''].includes(data) ? '' : data;
};


// get Trim
const getTrim = (data) => {
    return !empty(data) && typeof data === 'string' ? data.trim() : data;
};
exports.getTrim = getTrim;


// Get Value
const getValue = (value, returnType = 'n') => {
    defaultValues = { n: null, s: '', nm: 0, b: false };
    return empty(value) ? defaultValues[returnType] : getTrim(value);
};
exports.getValue = getValue;


// Get Bool (convert value into boolean return default value boolean)
const getBool = (value, defaultValue = false) => {
    value = getTrim(value);
    if (empty(value)) value = defaultValue;
    if (['false', false, 0, '0'].includes(value)) return false;
    if (['true', true, 1, '1'].includes(value)) return true;
    return defaultValue;
};
exports.getBool = getBool;


// Get Str (convert value into string return default value string)
const getStr = (value, defaultValue = '') => {
    value = getTrim(value);
    if (empty(value)) value = defaultValue;
    if (typeof value !== 'object') return value + '';
    return defaultValue;
};
exports.getStr = getStr;


// Get Val
const getVal = (value) => {
    return value || null;
};
exports.getVal = getVal;


// Get Num
const getNum = (value, defaultVal = 0) => {
    return isFinite(value) ? +value : defaultVal;
};
exports.getNum = getNum;

const getUtcDate = (value) => {
    return !empty(value) ? `${getDateFormat(value, 'YYYY-MM-DD')}T00:00` : null;
};
exports.getUtcDate = getUtcDate;

const getISTToUtcDate = (value) => {
    if(empty(value)) return null
    const [day, month, year] = value.split('-').map(Number);
    value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return !empty(value) ? `${getDateFormat(value, 'YYYY-MM-DD')}T00:00` : null;
};
exports.getISTToUtcDate = getISTToUtcDate;


const getISTToUtcEndOfDate = (value) => {
    if(empty(value)) return null
    const [day, month, year] = value.split('-').map(Number);
    value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return !empty(value) ? `${getDateFormat(value, 'YYYY-MM-DD')}T23:59:59` : null;
};
exports.getISTToUtcEndOfDate = getISTToUtcEndOfDate;

// } Value - helpers ---------------------------------


// Validation - helpers { --------------------------------
// Check Validation
exports.checkValidation = (reqData, validation) => {

    // required | objectId | boolean | number | in
    // helper
    const makeValidationMessage = (msg) => {
        msg = msg.replace('_', ' ').replace(/([A-Z])/g, ' $1');
        return msg.charAt(0).toUpperCase() + (msg.slice(1)).toLowerCase() + ', ';
    };

    let invalidCount = 0;
    let message = '';
    for (const dataKey in validation) {
        let validationList = validation[dataKey].split('|');
        validationList.forEach(exp => {
            let expFull = exp.split(':');
            let expKey = expFull[0];
            switch (expKey.trim()) {
                case 'required':
                    if (!(dataKey in reqData) || empty(reqData[dataKey])) {
                        message += makeValidationMessage(dataKey + ' field is required');
                        invalidCount += 1;
                    }
                    break;

                case 'objectId':
                    if (!empty(reqData[dataKey]) && !mongoose.Types.ObjectId.isValid(reqData[dataKey])) {
                        message += makeValidationMessage(dataKey + ' field is not valid object id');
                        invalidCount += 1;
                    }
                    break;

                case 'boolean':
                    if (!empty(reqData[dataKey]) && typeof reqData[dataKey] !== 'boolean') {
                        message += makeValidationMessage(dataKey + ' field is not a boolean');
                        invalidCount += 1;
                    }
                    break;

                case 'number':
                    if (!empty(reqData[dataKey]) && typeof reqData[dataKey] !== 'number') {
                        message += makeValidationMessage(dataKey + ' field is not a number');
                        invalidCount += 1;
                    }
                    break;

                case 'min':
                    if (!empty(reqData[dataKey]) && reqData[dataKey] < Number(expFull[1].trim())) {
                        message += makeValidationMessage(dataKey + ' field minimum value is ' + expFull[1].trim() + ' recommended');
                        invalidCount += 1;
                    }
                    break;

                case 'maxlength':
                    if (!empty(reqData[dataKey]) && reqData[dataKey].length > Number(expFull[1].trim())) {
                        message += makeValidationMessage(dataKey + ' field should be less than ' + expFull[1].trim() + ' characters');
                        invalidCount += 1;
                    }
                    break;

                case 'minlength':
                    if (!empty(reqData[dataKey]) && reqData[dataKey].length < Number(expFull[1].trim())) {
                        message += makeValidationMessage(dataKey + ' field should be grater than ' + expFull[1].trim() + ' characters');
                        invalidCount += 1;
                    }
                    break;

                case 'exactlength':
                    if (!empty(reqData[dataKey]) && reqData[dataKey].length !== Number(expFull[1].trim())) {
                        message += makeValidationMessage(dataKey + ' field must be exactly ' + expFull[1].trim() + ' characters');
                        invalidCount += 1;
                    }
                    break;


                case 'in':
                    if (!empty(reqData[dataKey]) && !expFull[1].trim().split(',').includes(reqData[dataKey].toString())) {
                        message += makeValidationMessage(dataKey + ' field value is not in valid list value (' + expFull[1].trim() + ')');
                        invalidCount += 1;
                    }
                    break;

                case 'date':
                    let isValidDate = true;
                    if (!empty(reqData[dataKey]) && (reqData[dataKey].length !== 10 || ['Invalid date', ''].includes(getDateFormat(reqData[dataKey])))) {
                        message += makeValidationMessage(dataKey + ' is not a valid date');
                        isValidDate = false;
                        invalidCount += 1;
                    }
                    if ((expFull[1] || '').trim() === 'past' && isValidDate && moment(reqData[dataKey]).isAfter(moment(moment(new Date()).format('YYYY-MM-DD')))) {
                        message += makeValidationMessage(dataKey + ' cannot be a future date');
                        invalidCount += 1;
                    }

                    break;



                case 'email':
                    if (!empty(reqData[dataKey]) && !isValidEmail(reqData[dataKey])) {
                        message += makeValidationMessage(dataKey + ' is not a valid email address');
                        invalidCount += 1;
                    }
                    break;

                case 'url':
                    if (!empty(reqData[dataKey]) && !isValidUrl(reqData[dataKey])) {
                        message += makeValidationMessage(dataKey + ' url is not valid');
                        invalidCount += 1;
                    }
                    break;

                case 'array':
                    if (!empty(reqData[dataKey]) && !Array.isArray(reqData[dataKey])) {
                        message += makeValidationMessage(dataKey + ' must be an array');
                        invalidCount += 1;
                    }
                    break;
            }

        });


    }

    if (message.length) message = message.slice(0, -2);
    return message;

};
// } Validation - helpers --------------------------------


// Directory - helpers { --------------------------------
// Get Full Url
exports.getFullUrl = (name = '') => {
    return process.env.APP_URL + name;
};
// } Directory - helpers --------------------------------


// Date Time - helpers { --------------------------------

// Get Date Format
const getDateFormat = (date, format = 'D MMM YY') => {
    try {
        return empty(date.toString()) ? '' : moment(date, 'YYYY-MM-DDTHH:mm:ss.SSS').format(format);
    } catch (e) { return ''; }
};
exports.getDateFormat = getDateFormat;

// Time Since
exports.timeSince = (date) => {
    if (!date || empty(date.toString())) return '';

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 24) return monthNames[date.getMonth()] + ' ' + date.getDate();

    if (interval > 1) return Math.floor(interval) + ' hrs ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mins ago';

    return Math.floor(seconds) + ' secs ago';
};

exports.convertIimeInverval = (interval, unit) => {
    switch (unit) {
        case 'm':
            return interval * 60;
        case 'h':
            return interval * 60 * 60;
        case 'd':
            return interval * 60 * 60 * 24;
        case 'w':
            return interval * 60 * 60 * 24 * 7;
        case 'y':
            return interval * 60 * 60 * 24 * 365;
        default:
            return interval;
    }
}

exports.formatDuration = (ms) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(2)} min`;
    if (ms < 86400000) return `${(ms / 3600000).toFixed(2)} h`;
    return `${(ms / 86400000).toFixed(2)} d`;
}
// } Date Time - helpers --------------------------------


// Mongoose - helpers { ---------------------------------
// Is Object Id
exports.isObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


// To Object Id
const toObjectId = (id) => {
    return mongoose.Types.ObjectId(id);
};
exports.toObjectId = toObjectId;


// New Object Id
const newObjectId = () => {
    return new mongoose.Types.ObjectId();
};
exports.newObjectId = newObjectId;


// Map To Obj
const mapToObj = (mapData) => {
    try {
        return Object.fromEntries(mapData || {});
    } catch (e) {
        return {};
    }
};
exports.mapToObj = mapToObj;
// } Mongoose - helpers ---------------------------------


// Obj Process - helpers { ---------------------------------
// Make Id List
const makeIdList = (record, keyName = '_id', isConvertString = true) => {
    try {

        if (!record) return [];
        let newIds = [];
        record.forEach(r => {
            newIds.push(isConvertString ? r[keyName].toString() : r[keyName]);
        });
        return newIds;
    } catch (e) {
        dd(record);
        dd(e);
    }
};
exports.makeIdList = makeIdList;


// Make List
exports.makeList = (record, keyName, isConvertString = false) => {
    return makeIdList(record, keyName, isConvertString);
};


// Array Sum
exports.arraySum = (arrayList) => {
    return empty(arrayList) ? 0 : arrayList.reduce((a, b) => a + b, 0);
};

// Sort Obj
exports.sortObj = (arrayObj, key) => {
    return arrayObj.sort((a, b) => a[key] - b[key]);
};

// Sort Obj with parameter order
exports.sortObjByOrder = (arrayObj, key, order = 1) => {
    return arrayObj.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        return (order === -1 ? bValue - aValue : aValue - bValue);
      });
};

// Is Equal
const isEqual = (v1, v2, isConvertString = true) => {
    return (isConvertString ? makeValue(v1).toString() : v1) === (isConvertString ? makeValue(v2).toString() : v2);
};
exports.isEqual = isEqual;

// Array Chunk
const arrayChunk = (data, chunkSize) => {
    if (empty(data)) return [];
    const newData = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        newData.push(data.slice(i, i + chunkSize));
    }
    return newData;
};
exports.arrayChunk = arrayChunk;


// To List
exports.toList = (value, isObjectId = false) => {
    if (empty(value)) return [];
    value = value.trim().split(',');
    let newList = [];
    value.forEach(v => {
        if (!empty(v) && !empty(v.trim())) newList.push(isObjectId ? toObjectId(v) : v);
    });
    return newList;
};


// Flip On Key
exports.flipOnKey = (record, keyName = '_id') => {
    if (empty(record)) return {};
    let newRecord = {};
    record.forEach(r => {
        if (r) newRecord[r[keyName]] = r;
    });
    return newRecord;
};


// Is Include
exports.isInclude = (values = [], find = '') => {
    let count = 0;
    values.forEach(v => {
        if (isEqual(v, find)) count += 1;
    });
    return count > 0;
};

// Obj Maker
exports.objMaker = (dataArray, keyPairs) => {
    const newData = [];
    if (empty(dataArray)) return newData;
    dataArray.forEach(r => {
        const rowSingle = {};
        for (const keys in keyPairs) {
            let dataKey = keys.split(':');
            let value = r[dataKey[1]];
            if (!empty(keyPairs[keys])) value = keyPairs[keys](value);
            rowSingle[dataKey[0]] = value;

        }
        newData.push(rowSingle);
    });
    return newData;
};

// } Obj Process - helpers ---------------------------------


// File Professor - helpers { ---------------------------------


// Get File Name
exports.getFileName = (url, isDetails = false) => {
    if (empty(url)) return null;
    let name = url.split('/').at(-1);
    if (isDetails) {
        let fullName = name;
        let nameSeprated = fullName.split('.') || [];
        return {
            fullName: fullName,
            name: nameSeprated[0] || null,
            type: '.' + nameSeprated[1] || null,
        };
    }
    return name;

};


// Format Req Files
exports.formatReqFiles = (req) => {
    let files = req.files;
    if (!empty(files)) {
        if (Array.isArray(files)) {
            files.forEach((r, i) => {
                if (empty(files[i].filename) && empty(r.src)) files[i].filename = r.key;
                // if (empty(r.src)) files[i].filename = r.key;
            });
        } else {
            let keys = Object.keys(files);
            keys.forEach(k => {
                if (!empty(files[k])) {
                    files[k].forEach((r, i) => {
                        if (empty(files[k][i].filename) && empty(r.filename)) files[k][i].filename = r.key;
                        // if (empty(r.filename)) files[k][i].filename = r.key;
                    });
                }
            });
        }
    }
    req.files = files;

    let file = req.file;
    if (!empty(file)) {
        if (empty(file.filename)) file.filename = file.key;
    }
    req.file = file;

    return req;

};
// } File Professor - helpers ---------------------------------

// Qrcode - helpers { ---------------------------------
exports.generateQrcode = (qrData, color = Constant.colorCode.yellow) => {
    try {
        let qrBuffer = qr.imageSync(qrData, { type: 'png', size: 11, color, transparent: true });
        let qrBase64Str = new Buffer.from(qrBuffer, 'base64').toString('base64');
        // dd(qrBase64Str, 'qrBase64Str');
        return { qrBase64Str, qrData };

    } catch (e) {
        dd(e);
        return null;
    }
};

// } Qrcode - helpers ---------------------------------


// Math Calculation - helpers { ---------------------------------
// Get Fixed Decimal Number

// Get Fixed Decimal
const getFixedDecimal = (value, fractionDigits = 4) => {
    if (typeof value === 'object') value = Number(value);
    if (typeof value === 'string') value = Number(value);
    return Number((value || 0).toFixed(fractionDigits));
};
exports.getFixedDecimal = getFixedDecimal;

const formatNumber = (value, fractionDigits = 4) => {
    // dd(typeof value);
    // dd(value);
    // dd(getFixedDecimal(value));
    try {
        if (typeof value === 'object') value = Number(value);
        if (typeof value === 'string') value = Number(value);
        return (value || 0).toFixed(fractionDigits);
    } catch (e) {
        dd(e);

        return (value || 0).toFixed(fractionDigits);

    }
};
exports.formatNumber = formatNumber;

// Get check Natural Number
const getNaturalNo = (value) => {
    return (empty(value) || value < 0) ? 0 : value;
};
exports.getNaturalNo = getNaturalNo;



// Check Non-Negative
const isNonNegative = (value) => {
    return !(empty(value) || value < 0);
};
exports.isNonNegative = isNonNegative;


// Get Percent
const getPercent = (amount, percent) => {
    amount = getNum(amount);
    percent = getNum(percent);
    return getFixedDecimal((amount * getNaturalNo(percent)) / 100);
};
exports.getPercent = getPercent;
// } Math Calculation - helpers ---------------------------------


const filterUsername = (value) => {
    return getStr(value).toLowerCase();
};
exports.filterUsername = filterUsername;

const getBase64FromUrl = async (url) => {

    return new Promise((resolve) => {
        request.get(url, (error, response, body) => {
            if (error && response.statusCode != 200) return resolve('');
            const base64Data = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(body).toString('base64');
            resolve(base64Data);
        });
    });
// }
    /*dd(url);
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result;   
        resolve(base64data);
      }
    });*/
};
exports.getBase64FromUrl = getBase64FromUrl;

const isValidEmail = (email) => {
    // return String(email || '').toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
};
exports.isValidEmail = isValidEmail;


const formatBytes = (x) => {


    let l = 0, n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
        n = n / 1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
};
exports.formatBytes = formatBytes;

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;

const relNumberDiffPer = (val1, val2) => {
    return  getFixedDecimal((100 * val2)  / val1, 2);
}
exports.relNumberDiffPer = relNumberDiffPer;

const loading = (data) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('  ' + data + '');
};
exports.loading = loading;

const getMemorySize = (data) => {
    // Serialize the variable
    const serializedVariable = v8.serialize(data);
    // Get the size in bytes
    const sizeInBytes = Buffer.byteLength(serializedVariable);
    return sizeInBytes || 0;
}
exports.getMemorySize = getMemorySize;

const getHeapStat = () => {
    let heap = v8.getHeapStatistics();
    // dd(heap,'heap');
    // let usage = (heap.used_heap_size / heap.heap_size_limit) * 100;
    // console.log(`usage: ${usage.toFixed(2)} | heap.heap_size_limit: ${formatBytes(heap.heap_size_limit)} | heap.used_heap_size: ${formatBytes(heap.used_heap_size)}`);
    // if (usage > 90) {
    //     console.log(`V8 heap usage close to the limit (${usage.toFixed(2)}%)`);
    // } else if (usage > 95) {
    //     console.log(`V8 heap usage very close to the limit (${usage.toFixed()}%)`);
    // }

    return { usage : (heap.used_heap_size / heap.heap_size_limit) * 100, used_heap_size: heap.used_heap_size, heap_size_limit: heap.heap_size_limit }
}
exports.getHeapStat = getHeapStat;

const isValidUrl = (stringURL) => {
    try {
      new URL(stringURL);
      return true;
    } catch (err) {
      return false;
    }
}
exports.isValidUrl = isValidUrl;


exports.cardNoFormat = (cardNo) => {
    return empty(cardNo) ? '' :
        (cardNo.slice(0, 4) + ' ' +
        cardNo.slice(4, 8) + ' ' +
        cardNo.slice(8, 12) + ' ' +
        cardNo.slice(12, 16));
}

exports.shortDescription = (description, max) => {
    try {
        if(empty(description) || typeof description !== 'string') return '';
        if(description.length <= max) return description;

        let shortString = description.substr(0, max-3);

        return (shortString.substr(0, Math.min(shortString.length, shortString.lastIndexOf(' '))))+'...';
    } catch(err) {
        return description;
    }
}

exports.calculateRatio = (balance, resultAmount) => {
    if (balance <= 0 || resultAmount <= 0) return 0;
  
    const ratio = resultAmount / balance;

    const ratioPercent = ratio * 100;
    // console.log(ratioPercent,'rataionpercent');
    return Number(ratioPercent);
}


const bindMessage = (rawMsg, values) => {
    try {
        // this function replaces %= placeholders in a string with values from an array, pass in 2nd arg value in array

        // set var in message {
        for(const value of values) {
            rawMsg = rawMsg.replace('%=', (value || '').toString().trim());
        }
        // } set var in message

        return rawMsg;
    } catch(e) {
        return null;
    }
}
exports.bindMessage = bindMessage;


exports.getError = (e, label = null) => {
    if(!e) return '';
    let errorMsg = `An error occurred: Unknown Error :(`;

    if(typeof e === 'string') errorMsg = e;
    else if(e.codeName && typeof e.codeName === 'string') errorMsg = `${e.code ? e.code+' ' : ''}${e.codeName}`;
    else if(typeof e.message === 'string') errorMsg = e.message;

    if(label) errorMsg = `${label} ${errorMsg}`;
    return errorMsg;

}