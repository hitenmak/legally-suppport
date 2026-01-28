// Models
const { Lambda } = require('aws-sdk');
const Category = require('../../models/Category');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');

//---------------------------------------------------------------------------------------------

// list
exports.list = async (req, res) => {
	const ret = res.ret;
	try {
		let list = await Category.find().exec();
		list = list.map((r) => {
			return {
				id: (r?._id),
				name: getStr(r?.name),
				label: getStr(r?.label),
			};
		})
		ret.sendSuccess(list, "Categories found");
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