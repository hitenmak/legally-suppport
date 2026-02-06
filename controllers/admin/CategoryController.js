// Models
const { Lambda } = require('aws-sdk');
const Category = require('../../models/Category');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const Pager = require('../../infrastructure/Pager');
//---------------------------------------------------------------------------------------------

// index
exports.index = (req, res) => {
	const ret = res.ret;
	ret.render('category/list', {});
}

// list
exports.list = async (req, res) => {
	const ret = res.ret;
	try {
		const reqData = req.body;
		let filters = {};

		// Page calculation {
		const Pgr = new Pager(reqData);
		if (Pgr?.isValidData) return ret.sendFail(Pgr?.isValidData);
		let isSortCreatedAt = reqData?.orderBy?.createdAt && (Object.keys(reqData?.orderBy).length == 1) && Object.keys(reqData?.orderBy)[0] == 'createdAt';
		let options = { page: reqData?.pageNumber || 1, limit: 10, sort: isSortCreatedAt ? { ...reqData?.orderBy } : reqData?.orderBy, lean: true, }
		// } Page calculation

		// Filters {
		if (!empty(Pgr.commonSearchFilters)) filters = { ...Pgr.commonSearchFilters };
		// d(filters, 'filters');
		// } Filters


		const pager = await Category.paginate(filters, options);
		let list = [];
		if (!empty(pager?.docs)) {
			(pager?.docs || []).forEach((r) => {
				r.id = (r?._id);
				r.name = getStr(r?.name);
				r.label = getStr(r?.label);
				r.createdAt = (r?.createdAt);
				list.push(r);
			})
		}

		ret.sendSuccess({ records: list, pageNumber: pager.page, totalPages: pager.totalPages, totalRecords: pager.totalDocs, limit: pager.limit, }, "Categories found");
	} catch (err) {
		return ret.err500(err);
	}
};
// list

exports.create = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {
		// check validation
		const isInvalid = checkValidation(reqData, {
			name: 'required|string',
			label: 'required|string',
		});
		if (isInvalid) return ret.sendFail(isInvalid);
		// check validation
		const isExist = await Category.findOne({ name: reqData?.name }).exec()
		if (isExist) return ret.sendFail('Category already exist');
		const category = new Category(reqData);
		await category.save();
		ret.sendSuccess(category);
	} catch (error) {
		ret.err500(error);
	}
}	