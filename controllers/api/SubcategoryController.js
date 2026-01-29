// Models
const { Lambda } = require('aws-sdk');
const SubCategory = require('../../models/SubCategory');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const Category = require('../../models/Category');

//---------------------------------------------------------------------------------------------

// list
exports.list = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {// check validation
		const isInvalid = checkValidation(reqData, {
			categoryId: 'required|objectId',
		});
		if (isInvalid) return ret.sendFail(isInvalid);
		// check validation
		const isExist = await Category.findOne({ _id: reqData?.categoryId }).exec();
		if (!isExist) return ret.sendFail('Category does not exist');

		let list = await SubCategory.find({ categoryId: reqData?.categoryId }).exec();
		list = list.map((r) => {
			return {
				id: (r?._id),
				categoryId: (r?.categoryId),
				name: getStr(r?.name),
				label: getStr(r?.label),
			};
		})
		ret.sendSuccess(list, "Subcategories found");
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