require('dotenv').config();
const { ShortCrypt } = require('short-crypt');


const { dd, empty, getNum, checkValidation, getBool } = require('../helpers/helpers');
const GenerateFile = require('./GenerateFile');
const Constant = require('../config/Constant');
const { getFullUrlAction } = require('../helpers/ejsHelpers');

class Pager
{

    constructor(pagerObj) {
        // this.reqIsGetCount = getBool(pagerObj.isGetCount);
        // this.reqPageSize = getNum(pagerObj.pageSize);
        this.reqFilters = pagerObj.filters;
        // this.reqPageNumber = getNum(pagerObj.pageNumber);
        this.tableLayout = pagerObj.tableLayout;
        // this.limit = this.reqPageSize;
        // this.start = this.reqPageSize * (this.reqPageNumber - 1);
        // this.orderBy = pagerObj.orderBy || { createdAt: 'desc' };
        // this.resData = {
        //     filters: this.reqFilters,
        //     pageSize: this.reqPageSize,
        //     pageNumber: this.reqPageNumber,
        //     reportDownloadUrl: null,
        //
        // };
        this.commonSearchFilters = this.applyFiltersCommonSearch(this.reqFilters.commonSearch, this.tableLayout);
        // this.isValidData = checkValidation(pagerObj, {
        //     filters: 'required',
        //     pageSize: 'required',
        //     pageNumber: 'required',
        // });

    }

    applyFiltersCommonSearch = (searchQuery, tableLayout) => {
        try {
            if (empty(searchQuery)) return {};
            let query = { $regex: searchQuery.toString().trim(), $options: 'i' };

            let orFilter = [];
            for (const key in tableLayout) {
                const layoutRow = tableLayout[key];
                if (layoutRow.isSearchable == 1) {
                    let col = {};
                    if (layoutRow.type === 'num') {
                        const searchVal = getNum(searchQuery, null);
                        if (searchVal !== null) col[key] = searchVal;
                    } else {
                        col[key] = query;

                    }
                    if (!empty(col)) orFilter.push(col);
                }
            }
            // dd({ '$or': orFilter });
            return empty(orFilter) ? {} : { '$or': orFilter };
        } catch (e) {return null;}

    };

    // totalRecordCalculate = (query) => {
    //     return new Promise(async (resolve, reject) => {
    //         if (!this.reqIsGetCount) return resolve(true);
    //         // if (this.reqPageNumber !== 1) return resolve(true);
    //         let records = await query.exec();
    //         this.totalRecords = records.length;
    //         this.resData.totalRecords = this.totalRecords;
    //         this.resData.totalPages = Math.ceil(this.totalRecords / this.limit);
    //         return resolve(true);
    //     });
    // };

    exportReport = (query, cb, isUrl = 1) => {
        return new Promise(async (resolve, reject) => {

            let pager = await query;
            if(empty(pager.docs)) return resolve(null);

            const newData = [];
            (pager.docs || []).forEach((row) =>{
                newData.push(cb(row));
            });

            const generateFile = new GenerateFile();
            const reportDownloadUrl = await generateFile.json2csv(newData, 'report', false);
            // dd(reportDownloadUrl,'reportDownloadUrl');

            // if(isUrl){
            let reportUrl = !empty(reportDownloadUrl) ? reportDownloadUrl : null;
            // } else {
            //     const cryptr = new ShortCrypt(Constant.cryptrSecret);
            //     this.resData.reportDownloadUrl = getFullUrlAction(`download-file/`+cryptr.encryptToURLComponent(reportDownloadUrl))
            // }
            return resolve(reportUrl);
        }).catch(error => { console.log(error)});
    };

}

module.exports = Pager;