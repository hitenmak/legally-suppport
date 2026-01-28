// Models
const Admin = require('../../models/Admin');
const DataSets = require('./dataSets');


// Helpers
const { d } = require('../../helpers/helpers');


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