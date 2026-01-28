require('dotenv').config();
const jwt = require('jsonwebtoken');
const moment = require('moment');

// Models
const User = require('../models/User');
// const AppSetting = require('../models/AppSetting');

// Helpers
const {dd, empty, ddm, getBool} = require('../helpers/helpers');
// const DataManipulate = require('../helpers/dataManipulate');
const Constant = require('../config/Constant');
//---------------------------------------------------------------------------------------------


exports.authUser = async(req, res, next) => {

    let token = req.headers.authorization;
    if(empty(token)) return res.status(401).send('UNAUTHORIZED - Token not found!');

    token = token.replace('Bearer ', '');

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {

        if(err || !payload || empty(payload._id)) return res.status(401).send('UNAUTHORIZED - Invalid token!');
        User.findById(payload._id).then(async record => {

            if(empty(record) || !(record.email)) return res.status(401).send('UNAUTHORIZED - User not found!');

            req._user = record;
            req.user = {...record._doc, id: record._id.toString()};
            req.user.hash = undefined;
            req.user.salt = undefined;

            req.userId = record._id;
            req.uid = record._id.toString();

            next();

        }).catch(err => {
            dd(err);
            return res.ret.render('errors/500');
        });

    });

};

exports.authBasic = (req, res, next) => {
    const BASIC_API_TOKEN = process.env.BASIC_API_TOKEN
    const token = req.headers?.authorization;
    try {
        if(token !== BASIC_API_TOKEN)
            return res.status(401).send('UNAUTHORIZED_ACCESS');
        next();
    } catch(err) {
        dd(err)
        return res.ret.render('error/500');
    }
}