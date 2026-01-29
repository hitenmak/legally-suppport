// Models
// const Question = require('../../models/Question');
const SubCategory = require('../../models/SubCategory');


// Helpers
const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');
const Constant = require('../../config/Constant');
//---------------------------------------------------------------------------------------------

// list
exports.list = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {// check validation
		const isInvalid = checkValidation(reqData, {
			slug: `required|in: ${Constant?.questionKeys}`,
		});
		if (isInvalid) return ret.sendFail(isInvalid);
		// check validation
		// if (!isExist) return ret.sendFail('SubCategory does not exist');

		console.log("reqData?.slug:", reqData?.slug);
		let list = Constant.questions[reqData?.slug];
		if (!list) {
			return ret.sendFail('questions does not exist for this category/subctegory');
		}
		list = list = list.map((r) => {
			return {
				key: getStr(r?.key),
				label: getStr(r?.label),
				type: getStr(r?.type),
				options: r?.options ? (r?.options || []).map((o) => {
					return {
						key: getStr(o?.key),
						value: getStr(o?.value),
					}
				}) : undefined,
				optional: getBool(r?.optional),
			};
		})
		ret.sendSuccess(list, "Subcategories found");
	} catch (err) {
		return ret.err500(err);
	}
};
// list