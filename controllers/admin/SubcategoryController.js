// Models
const { Lambda } = require('aws-sdk');
const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const Pager = require('../../infrastructure/Pager');

//---------------------------------------------------------------------------------------------
// index
exports.index = async (req, res) => {
	const ret = res.ret;
	const categories = await Category.find({});
	ret.render('subcategory/list', { categories });
}

// list
exports.list = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {// check validation
		let filters = {};

		// Page calculation {
		const Pgr = new Pager(reqData);
		if (Pgr.isValidData) return ret.sendFail(Pgr.isValidData);
		let isSortCreatedAt = reqData?.orderBy?.createdAt && (Object.keys(reqData?.orderBy).length == 1) && Object.keys(reqData?.orderBy)[0] == 'createdAt';
		let options = { page: reqData?.pageNumber || 1, limit: 10, populate: 'categoryId', sort: isSortCreatedAt ? { lastRepliedAt: 'desc', ...reqData?.orderBy } : reqData?.orderBy, lean: true, }
		// } Page calculation

		// Filters {
		if (!empty(Pgr.commonSearchFilters)) filters = { ...Pgr.commonSearchFilters };
		if (reqData?.filters?.categoryId) filters = { ...filters, categoryId: reqData?.filters?.categoryId };
		// d(filters, 'filters');
		// } Filters

		const pager = await SubCategory.paginate(filters, options);
		let records = (pager?.docs || []).map((r) => {
			return {
				// actionEdit: getFullUrl(`/admin/subcategory/edit/${r?._id}`),
				id: (r?._id),
				name: (r?.name),
				label: (r?.label),
				categoryId: (r?.categoryId?._id),
				categoryName: (r?.categoryId?.label),
			};
		});
		const resData = { records: records, pageNumber: pager.page, totalPages: pager.totalPages, totalRecords: pager.totalDocs, limit: pager.limit, }
		ret.sendSuccess(resData, "SubCategories found");
	} catch (err) {
		return ret.err500(err);
	}
};
exports.create = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {
		// check validation
		const isInvalid = checkValidation(reqData, {
			name: 'required|string',
			label: 'required|string',
			categoryId: 'required|objectId',
		});
		if (isInvalid) return ret.sendFail(isInvalid);
		// check validation
		const isCategoryExist = await Category.findOne({ _id: reqData?.categoryId }).exec()
		if (!isCategoryExist) return ret.sendFail('Category does not exist');

		const isExist = await SubCategory.findOne({ name: reqData?.name }).exec()
		if (isExist) return ret.sendFail('SubCategory already exist');
		const subCategory = new SubCategory(reqData);
		await subCategory.save();
		ret.sendSuccess(subCategory);
	} catch (error) {
		ret.err500(error);
	}
}	