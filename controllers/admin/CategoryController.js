// Models
const { Lambda } = require('aws-sdk');
const Category = require('../../models/Category');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const Pager = require('../../infrastructure/Pager');
const SubCategory = require('../../models/SubCategory');
const { getFullUrlAction } = require('../../helpers/ejsHelpers');
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
				r.actionDetails = getFullUrlAction(`category/details/${r?._id}`);
				r.actionDeleteDirect = getFullUrlAction(`category/delete/${r?._id}`);
				list.push(r);
			})
		}

		ret.sendSuccess({ records: list, pageNumber: pager.page, totalPages: pager.totalPages, totalRecords: pager.totalDocs, limit: pager.limit, }, "Categories found");
	} catch (err) {
		return ret.goBackError(err);
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
		ret.goBackError(error);
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
		const isExist = await Category.findOne({ _id: { $ne: reqData?.id }, label: (reqData?.label).trim() }).exec()
		if (isExist) return ret.sendFail(`Category ${reqData?.label} already exist`);
		const category = await Category.findOne({ _id: reqData?.id }).exec();
		if (!category) return ret.sendFail(`Category ${reqData?.label} does not exist`);
		// category.name = reqData?.name;
		category.label = reqData?.label;
		await category.save();
		// ret.redirect(`category/details/${category?._id}`, "Updated");
		ret.goBackSuccess("Updated");
	} catch (error) {
		ret.goBackError(error);
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

		const category = await Category.findById(req?.params?.id).exec();
		if (!category) return ret.goBackError(`Category does not exist`);

		// delete category
		const deletionRes = await Category.findByIdAndDelete(req?.params?.id).exec();
		if (!deletionRes) return ret.goBackError(`Category not deleted`);

		// delete subcategories
		const delSubCatRes = await SubCategory.deleteMany({ categoryId: req?.params?.id }).exec();
		if (!delSubCatRes) return ret.goBackError(`Subcategories not deleted`);
		ret.redirectSuccess("categories", "Category deleted");
	} catch (error) {
		ret.goBackError(error);
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
		const category = await Category.findOne({ _id: req?.params?.id }).exec();
		category.createdAt = getDateFormat(category?.createdAt);
		if (!category) return ret.goBackError(`Category does not exist`);
		ret.render(`category/details`, category);
	} catch (error) {
		ret.goBackError(error);
	}
}