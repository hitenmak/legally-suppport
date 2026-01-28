const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');

// Helpers
const { dd, empty } = require('../helpers/helpers');
//---------------------------------------------------------------------------------------------


exports.isVerify = (req, res, next) => {

    let token = req.headers.authorization;
    if (empty(token)) return res.status(401).send('UNAUTHORIZED - Token not found!');

    token = token.replace('Bearer ', '');

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {

        if (err || !payload || empty(payload._id)) return res.status(401).send('UNAUTHORIZED - Invalid token!');
        User.findById(payload._id).then(record => {

            if (empty(record)) return res.status(401).send('UNAUTHORIZED - User not found!');
            if (!record.status) return res.status(401).send('UNAUTHORIZED - Your account has been disabled.');

            req._user = record;
            req.user = { ...record._doc, id: record._id.toString() };
            req.user.hash = undefined;
            req.user.salt = undefined;

            req.userId = record._id;
            req.uid = record._id.toString();
            next();

        }).catch(err => {
            dd(err);
            return ret.render('errors/500');
        });

    });

};

