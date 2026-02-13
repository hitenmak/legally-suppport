// Models
const { Lambda } = require('aws-sdk');
const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const Pager = require('../../infrastructure/Pager');
const { getFullUrlAction } = require('../../helpers/ejsHelpers');

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
				actionDetails: getFullUrlAction(`subcategory/details/${r?._id}`),
				actionDeleteDirect: getFullUrlAction(`subcategory/delete/${r?._id}`)
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

exports.update = async (req, res) => {
	const ret = res?.ret;
	const reqData = req?.body;
	try {
		// check validation
		const isInvalid = checkValidation(reqData, {
			id: 'required|objectId',
			// name: 'required|string',
			label: 'required|string',
		});
		if (isInvalid) return ret.sendFail(isInvalid);
		// check validation

		// check subcategory exist
		const subCategory = await SubCategory.findOne({ _id: reqData?.id }).exec();
		if (!subCategory) return ret.goBackError(`SubCategory ${reqData?.label} does not exist`);

		// check subcategory with same name
		const isExist = await SubCategory.findOne({ _id: { $ne: reqData?.id }, label: (reqData?.label).trim() }).exec();
		if (isExist) return ret.goBackError(`SubCategory ${reqData?.label} already exist`);

		subCategory.label = reqData?.label;
		await subCategory.save();
		ret.redirectSuccess("subcategories", "Sub Category deleted");

	} catch (error) {
		ret.err500(error);
	}
}

exports.delete = async (req, res) => {
	const ret = res?.ret;
	const reqData = req?.body;
	try {
		// check validation
		const isInvalid = checkValidation(req?.params, {
			id: 'required|objectId',
		});
		if (isInvalid) return ret.goBackError(isInvalid);
		// check validation
		const subCategory = await SubCategory.findOne({ _id: req?.params?.id }).exec();
		if (!subCategory) return ret.goBackError(`SubCategory does not exist`);
		// delete subcategory
		const deletionRes = await SubCategory.findByIdAndDelete(req?.params?.id).exec();
		if (!deletionRes) return ret.goBackError(`SubCategory not deleted`);
		ret.redirectSuccess("subcategories", "Sub Category deleted");
	} catch (error) {
		ret.err500(error);
	}
}


exports.details = async (req, res) => {
	const ret = res?.ret;
	const reqData = req?.body;
	try {
		// check validation
		const isInvalid = checkValidation(req?.params, {
			id: 'required|objectId',
		});

		if (isInvalid) return ret.goBackError(isInvalid);
		// check validation
		const subCategory = await SubCategory.findOne({ _id: req?.params?.id }).exec();
		subCategory.createdAt = getDateFormat(subCategory?.createdAt);
		if (!subCategory) return ret.goBackError(`SubCategory does not exist`);
		ret.render(`subcategory/details`, subCategory);
	} catch (error) {
		ret.goBackError(error);
	}
}