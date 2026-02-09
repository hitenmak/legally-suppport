const jwt = require('jsonwebtoken');

// Models
const Admin = require('../models/Admin');

// Helpers
const { dd, ddm, empty } = require('../helpers/helpers');
const Msg = require('../messages/admin');
//---------------------------------------------------------------------------------------------


exports.authUser = (req, res, next) => {


    const ret = res.ret;
    const session = req.session;
    // ddm(session.token, 'admin token');
    // TODO: Static token
    if(process.env.APP_TYPE === 'development' && process.env.APP_ADMIN_TOKEN) session.token = process.env.APP_ADMIN_TOKEN;

    if (empty(session.token)) return ret.redirect('login');

    jwt.verify(session.token, process.env.JWT_SECRET_KEY, (err, payload) => {
        if (err || !payload || empty(payload._id)) return ret.redirect('login');
        Admin.findById(payload._id).then(record => {

            if (empty(record)) return ret.redirect('login');
            if (!record.isActive) return ret.redirect('login', Msg.auth.accountNotAccess);
            const user = { ...record._doc, id: record._id.toString() };

            req.user = user;
            req.user.hash = undefined;
            req.user.salt = undefined;
            req.userPermission = JSON.parse(user?.permission) || {};
            req.isMasterAdmin = user?.isMaster || false;
            // if (req.user.isMaster) {
            //     for (k in permission) {
            //         permission[k] = getBool(permission[k]);
            //     }
            // }
            next();

        }).catch(err => {
            dd(err);
            return ret.render('errors/500');
        });

    });

};

