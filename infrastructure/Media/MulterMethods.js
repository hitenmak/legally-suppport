require('dotenv').config();

const multer = require('multer');

const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const path = require('path');
const fs = require('fs');

// Helpers
const {dd, ddm, de, empty, toList} = require('../../helpers/helpers');
const chalk = require('../../helpers/chalk');


//---------------------------------------------------------------------------------------------
// Bucket Config {
aws.config.update({
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    region: process.env.AWS_S3_REGION,
});

const s3 = new aws.S3({apiVersion: '2006-03-01'});

// Check Connection
s3.listBuckets((err, data) => {
    if(err) {
        // de(err, 'ERR BUCKET NOT CONNECTED');
        chalk.printLog('ERR S3BUCKET - ' + ` buckets not connected (${err?.code})`, 'FgRed');
        new Error(err);
    } else chalk.printLog('S3BUCKET - ' + ((data.Buckets || []).length) + ' buckets connected', 'FgCyan');
});
// } Bucket Config


//---------------------------------------------------------------------------------------------
const isLocalStorageSet = 1;
const basePath = './public/storage/';

//---------------------------------------------------------------------------------------------

// Helpers {
const getBaseUrl = (isFullUrl = 1, isLocalStorage = null) => {
    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    return isLocalStorage ? (isFullUrl ? process.env.APP_URL + '/storage/' : '/storage/') : process.env.AWS_S3_BUCKET_BASE_URL + '/';
};
exports.getBaseUrl = getBaseUrl;


const getImageName = () => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for(let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return Date.now() + result;
};


const fileFilter = (allowFileTypes = 'image') => {
    // allowFileTypes = allowFileTypes.replace(',', '|');
    // jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG|doc|DOC|docx|DOCX|xlsx|XLSX|xls|XLS|pdf|PDF|ppt|PPT|pptm|PPTM|xps|XPS|potx|POTX|ppsx|PPSX|ppsm|PPSM|pps|PPS|pptx|PPTX|odp|ODP|mp4|MP4
    return (req, file, cb) => {
        if(allowFileTypes === 'image') {
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
                req.fileValidationError = 'Only image and files are allowed!';
                return cb(new Error('Only image and files are allowed!'), false);
            }
        } else if(allowFileTypes === 'attachments') {
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG|doc|DOC|docx|DOCX|xlsx|XLSX|xls|XLS|pdf|PDF|ppt|PPT|pptm|PPTM|xps|XPS|potx|POTX|ppsx|PPSX|ppsm|PPSM|pps|PPS|pptx|PPTX|odp|ODP|mp4|MP4)$/)) {
                req.fileValidationError = 'Only image and files are allowed!';
                return cb(new Error('Only image and files are allowed!'), false);
            }
        } else {
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|mp4|MP4|MOV|mov|AVI|avi|WEBM|webm)$/)) {
                req.fileValidationError = 'Only image and files are allowed!';
                return cb(new Error('Only image and files are allowed!'), false);
            }
        }
        cb(null, true);
    };
};

/*const fileAndVideoFilter = (allowFileTypes = '') => {
    // allowFileTypes = allowFileTypes.replace(',', '|');
    // jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG|doc|DOC|docx|DOCX|xlsx|XLSX|xls|XLS|pdf|PDF|ppt|PPT|pptm|PPTM|xps|XPS|potx|POTX|ppsx|PPSX|ppsm|PPSM|pps|PPS|pptx|PPTX|odp|ODP|mp4|MP4
    return (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|mp4|MP4|MOV|mov|AVI|avi|WEBM|webm)$/)) {
            req.fileValidationError = 'Only image and files are allowed!';
            return cb(new Error('Only image and files are allowed!'), false);
        }
        cb(null, true);
    };
};*/


const makeNewDir = (folderName) => {
    try {
        if(!fs.existsSync(basePath + folderName)) fs.mkdirSync(basePath + folderName);
    } catch(e) {
    }
};
exports.makeNewDir = makeNewDir;


/*const makeFileCopy = (fromFileName, toFileName = null, fromFileDir = null, toFileDir = null) => {
    return new Promise((resolve, reject) => {
        if (empty(toFileName)) toFileName = getImageName() + getFileName(fromFileName, true).type;
        try {
            s3.copyObject({
                ACL: 'public-read',
                CopySource: AppConstant.awsBucketName + '/' + fromFileDir + '/' + fromFileName,
                Bucket: AppConstant.awsBucketName + '/' + toFileDir,
                Key: toFileName
            }, (err, data) => {
                resolve(!empty(err) ? null : toFileName);
            });
        } catch (e) {resolve(null);}

        /!*if (empty(toFileName)) toFileName = getImageName() + getFileName(fromFileName, true).type;

        makeNewDir(fromFileDir);
        makeNewDir(toFileDir);
        try {
            fs.copyFile(basePath + fromFileDir + '/' + fromFileName, basePath + toFileDir + '/' + toFileName, (err) => {
                resolve(!empty(err) ? null : toFileName);
            });
        } catch (e) {resolve(null);}*!/
    });

};
exports.makeFileCopy = makeFileCopy;*/


/*const makeFileCopyLocal = (fromFileName, toFileName = null, fromFileDir = null, toFileDir = null) => {
    return new Promise((resolve, reject) => {

        if (empty(toFileName)) toFileName = getImageName() + getFileName(fromFileName, true).type;

        makeNewDir(fromFileDir);
        makeNewDir(toFileDir);
        try {
            fs.copyFile(basePath + fromFileDir + '/' + fromFileName, basePath + toFileDir + '/' + toFileName, (err) => {
                resolve(!empty(err) ? null : toFileName);
            });
        } catch (e) {resolve(null);}
    });

};*/


// Multer Storage  ---------------------------------------------------------------------------------------------
const getStorage = (folderName, isLocalStorage) => {
    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    // dd(isLocalStorage);
    return isLocalStorage
        // Local Storage {
        ? multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, basePath + folderName);
            },
            filename: (req, file, cb) => {
                cb(null, getImageName() + path.extname(file.originalname));
            }
        })
        // } Local Storage

        // Bucket Storage {
        : multerS3({
            s3: s3,
            acl: 'public-read',
            bucket: process.env.AWS_S3_BUCKET_NAME + '/' + folderName,
            // contentType: multerS3.AUTO_CONTENT_TYPE,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: (req, file, cb) => {
                cb(null, {fieldName: ''});
            },
            key: (req, file, cb) => {
                cb(null, getImageName() + path.extname(file.originalname));
            }
        });
    // } Bucket Storage

};


//----------------------------------------------
// Methods {

exports.single = (fieldName, folderName, allowFileTypes = null, isLocalStorage = null) => {
    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    makeNewDir(folderName);

    return multer({
        fileFilter: fileFilter(allowFileTypes),
        storage: getStorage(folderName, isLocalStorage),
    }).single(fieldName);

};


exports.multiple = (fieldName, folderName, allowFileTypes = null, isLocalStorage = null) => {
    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    makeNewDir(folderName);

    return multer({
        fileFilter: fileFilter(allowFileTypes),
        storage: getStorage(folderName, isLocalStorage),
    }).array(fieldName);

};


exports.many = (fieldName, folderName, allowFileTypes = null, isLocalStorage = null) => {
    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    makeNewDir(folderName);
    let fields = [];
    toList(fieldName).forEach(f => fields.push({name: f}));
    return multer({
        fileFilter: fileFilter(allowFileTypes),
        storage: getStorage(folderName, isLocalStorage),
    }).fields(fields);
};


exports.any = (folderName, validateFile = null, isLocalStorage = null, req, file) => {

    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    makeNewDir(folderName);
    return multer({
        fileFilter: fileFilter(validateFile),
        storage: getStorage(folderName, isLocalStorage),
    }).any();

};

// } Methods
//----------------------------------------------


const unlinkMediaFile = (imagePath, isLocalStorage = null) => {
    isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;
    if(isLocalStorage) {
        // Local Delete {
        try {

            fs.exists(imagePath, (exists) => {
                if(exists) fs.unlinkSync(imagePath);
                return exists;
            });
        } catch(e) {
            return false;
        }
        // } Local Delete
    } else {
        try {
            // Bucket Delete {
            if(empty(imagePath)) return null;
            imagePath = imagePath.replace(basePath, '');
            let deleteObjects = [];
            deleteObjects.push({
                Key: imagePath,
            });

            let deletedList = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Delete: {Objects: deleteObjects}
            };
            s3.deleteObjects(deletedList, (err, data) => {
                return !!err;
            });
        } catch(e) {
            return false;
        }
        // } Bucket Delete
    }
};
exports.unlinkMediaFile = unlinkMediaFile;


exports.unlinkMediaMultiple = (imageNames, folderName, isLocalStorage = null) => {
    try {

        isLocalStorage = !empty(isLocalStorage) ? isLocalStorage : isLocalStorageSet;

        if(empty(imageNames)) return false;
        if(typeof imageNames === 'string') imageNames = [imageNames];
        imageNames.forEach(name => {
            unlinkMediaFile(basePath + folderName + '/' + name, isLocalStorage);
        });
        return true;
    } catch(e) {
        de(e);
        return true;
    }
};


// } Helpers
//---------------------------------------------------------------------------------------------


// Get Media Names ||||||||||||||||||||||||||||||||||||||||||||||||
// exports.shortNames = (files) => {
//     let shortedFiles = {};
//     if (files) {
//         files.forEach((row, i) => {
//             if (!(row['fieldname'] in shortedFiles)) {
//                 shortedFiles[row['fieldname']] = [];
//             }
//             shortedFiles[row['fieldname']].push(row['filename']);
//         });
//     }
//     return shortedFiles;
// };

const uploadToS3 = (path, mimeType, folderName) => {
    const awsS3 = new aws.S3({});
    const params = {
        ACL: 'public-read',
        Bucket: process.env.AWS_S3_BUCKET_NAME + '/' + folderName,
        Body: fs.createReadStream(path),
        ContentType: mimeType,
        Key: path.split('/').splice(-1)[0],
    };
    return new Promise((resolve, reject) => {
        awsS3.upload(params, (err, data) => {
            if(err) {
                return resolve(null);
            }
            if(data) {
                if(path)
                    // fs.unlinkSync(path);
                    try {
                        fs.unlinkSync(path);
                        console.log('File deleted successfully');
                    } catch(err) {
                        console.error('Error deleting file:', err);
                    }
                return resolve(data.Location);
            }
        });
    });
};
exports.uploadToS3 = uploadToS3;