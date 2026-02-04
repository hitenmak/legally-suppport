// Models
const Constant = require('../../config/Constant');
const Notification = require('../../models/Notification');

const { d, dd, checkValidation, getNum, empty, getFullUrl, getValue, getBool, getDateFormat, objMaker, getStr, timeSince, formatReqFiles } = require('../../helpers/helpers');

//---------------------------------------------------------------------------------------------

// list
exports.list = async (req, res) => {
	const ret = res.ret;
	try {
		let list = await Notification.find({ receiverId: req?.user?._id, isRead: false }).populate("receiverId actionUserId").sort({ createdAt: -1 }).exec();

		list = list.map((r) => {
			return {
				id: (r?._id),
				receiverId: {
					id: (r?.receiverId?._id),
					name: getStr(r?.receiverId?.name),
					email: getStr(r?.receiverId?.email),
				},
				receiverType: getStr(r?.receiverType),
				actionUserId: {
					id: (r?.actionUserId?._id),
					name: getStr(r?.actionUserId?.name),
					email: getStr(r?.actionUserId?.email),
				},
				actionUserType: getStr(r?.actionUserType),
				moduleId: (r?.moduleId),
				moduleType: getStr(r?.moduleType),
				message: getStr(r?.message),
				isRead: getBool(r?.isRead),
			};
		})
		ret.sendSuccess(list, "Notifications found");
	} catch (err) {
		return ret.err500(err);
	}
};
// list

// create
exports.create = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {

		// check validation
		const isInvalid = checkValidation(reqData, {
			receiverId: 'required|objectId',
			receiverType: `required|string|in:${Constant?.userType}`,
			actionUserId: 'required|objectId',
			actionUserType: `required|string|in:${Constant?.userType}`,
			moduleId: 'required|objectId',
			moduleType: 'required|string',
			message: 'required|string',
		})
		const notification = new Notification(reqData);
		await notification.save();
		ret.sendSuccess(notification);
	} catch (err) {
		return ret.err500(err);
	}
}

exports.read = async (req, res) => {
	const ret = res.ret;
	const reqData = req.body;
	try {
		// check validation
		const isInvalid = checkValidation(reqData, {
			id: 'required|objectId',
		})
		if (isInvalid) return ret.sendFail(isInvalid);
		await Notification.findByIdAndUpdate({ _id: reqData.id }, { $set: { isRead: true } }).exec();
		ret.sendSuccess({}, 'Notification read');
	} catch (err) {
		return ret.err500(err);
	}
}
// create

