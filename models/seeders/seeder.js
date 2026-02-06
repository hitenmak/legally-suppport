// Models
const Admin = require('../../models/Admin');
const DataSets = require('./dataSets');


// Helpers
const { d } = require('../../helpers/helpers');
const Category = require('../Category');
const SubCategory = require('../SubCategory');
const Notification = require('../Notification');

//--------------------------------------------------------------

//--------------------------------------------------------------

exports.adminSeeder = async ({ isTruncate }) => {
	try {
		if (isTruncate) {
			await Admin.deleteMany({});
		}
		for (const admin of DataSets?.admins()) {
			await Admin.updateOne({ email: admin?.email }, { $setOnInsert: admin }, { upsert: true });
		}
		d('Admin Seeded');
	} catch (error) {
		d(error);
	}
};

exports.categorySeeder = async ({ isTruncate }) => {
	try {
		if (isTruncate) {
			await Category.deleteMany({});
		}
		for (const category of DataSets?.categories()) {
			await Category.updateOne({ name: category?.name }, { $setOnInsert: category }, { upsert: true });
		}
		d('Category Seeded');
	} catch (error) {
		d(error);
	}
}

exports.subcategorySeeder = async ({ isTruncate }) => {
	try {
		if (isTruncate) {
			await SubCategory.deleteMany({});
		}
		for (const subcategory of DataSets?.subCategories()) {
			await SubCategory.updateOne({ name: subcategory?.name }, { $setOnInsert: subcategory }, { upsert: true });
		}
		d('SubCategory Seeded');
	} catch (error) {
		d(error);
	}
}

exports.noficationSeeder = async ({ isTruncate }) => {
	try {
		if (isTruncate) {
			await Notification.deleteMany({});
		}
		for (const notification of DataSets?.notifications()) {
			await Notification.updateOne({ email: notification?.email }, { $setOnInsert: notification }, { upsert: true });
		}
		d('Notification Seeded');
	} catch (error) {
		d(error);
	}
};