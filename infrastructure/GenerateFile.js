const moment = require('moment');
const fs = require('fs');

const {Parser} = require('json2csv');
const {makeNewDir, uploadToS3} = require('../infrastructure/Media/MulterMethods');
const {dd, ddm, de} = require('../helpers/helpers');


const basePath = './public/storage/';

class GenerateFile {
    constructor() {
    }

    json2csv = async (data, folderName, isLocalStorage = 1) => {
        try{
            makeNewDir(folderName);
            const json2csvParser = new Parser();
            const csv = await json2csvParser.parse(data);
            const fileName = moment().format('DD-MM-YYYY-HH-mm-ss');
            let filePath = `${basePath}${folderName}/${fileName}.csv`;
            // dd(filePath)
    
            /*try {
                fs.writeFileSync(filePath, csv);
                // file written successfully
                return isLocalStorage ? filePath : await uploadToS3(filePath, 'text/csv', folderName)
            } catch (e) {
                de(e);
                return null;
            }*/
    
//            await fs.writeFile(filePath, csv, async err => {
//                dd(err, 'err');
//                if (err) return null;
//            });
//            const s3Path = await uploadToS3(filePath, 'text/csv', folderName);
//            dd(s3Path, 's3Path');
//            return isLocalStorage ? filePath : s3Path;
		return isLocalStorage;
        }
        catch(err){
            console.error('Error in json2csv:', err);
        }
    }
}

module.exports = GenerateFile;