const express = require('express');
const router = express.Router();


//----------------------------------------------
const { d, dd } = require('../helpers/helpers');
const { authUser, authBasic } = require('../middleware/api');
const Constant = require('../config/Constant');
// const { rateVeryLow, rateLow, rateMedium, rateHigh, rateVeryHigh } = require('../middleware/rateLimite');
//----------------------------------------------


//----------------------------------------------
const DashboardController = require('../controllers/api/DashboardController');
const AuthController = require('../controllers/api/AuthController');
const SupportTicketController = require('../controllers/api/SupportTicketController');
const CategoryController = require('../controllers/api/CategoryController');
const SubCategoryController = require('../controllers/api/SubcategoryController');
const QuestionController = require('../controllers/api/QuestionController');
const NotificationController = require('../controllers/api/NotificationController');
//----------------------------------------------


//----------------------------------------------
// Route Config {
router.all('*', (req, res, next) => {
    // req.app.set('layout', 'user/includes/layout');
    res.ret.viewPrefix = 'user/';
    res.ret.routePrefix = '/user';
    next();
});
// } Route Config
//----------------------------------------------

//----------------------------------------------
// Route Config {

/*router.all('*', (req, res, next) => {
    const ret = res.ret;
    return ret.sendFail( Constant.server.maintenance)
});*/

// } Route Config
//----------------------------------------------


//----------------------------------------------
// MIDDLEWARE - Authorization {
// router.all('*', authUser);
// } MIDDLEWARE - Authorization
//----------------------------------------------


//----------------------------------------------
// Direct Cron Run {

// router.post('/export/list',require('../export/getReport').index);
/*
router.get('/migration/buy-coins', require('../migration/bulkBuyCoinAdd').index);
router.post('/export/list',require('../export/getListBetweenDates').index);
router.get('/migration/withdraw-valid',require('../migration/withdrawAvalibleUsers').index);
*/

// router.get('/migration/delete-users',require('../migration/deleteUsers').index);

// } Direct Cron Run
//----------------------------------------------




// Dashboard
router.all('/dashboard', authUser, DashboardController.details);
router.get('/dashboard/team', authUser, DashboardController.teamDetails);


// Auth
router.post('/register', AuthController.register);
router.post('/updateuser', AuthController.updateuser);

router.post('/register/check-user', AuthController.checkUser);
router.post('/login', AuthController.login);
router.post('/logout', authUser, AuthController.logout);
router.post('/check-email', AuthController.checkEmail);


router.post('/otp/resend', authUser, AuthController.otpResend);
router.post('/otp/verify', authUser, AuthController.otpVerify);

router.post('/password/forgot', AuthController.forgotPassword);
router.post('/password/set', authUser, AuthController.setPassword);
router.post('/password/change', authUser, AuthController.changePassword);


// Support Ticket
router.post('/support-ticket/create', authUser, SupportTicketController.create);
router.post('/support-ticket/createticket', SupportTicketController.createticket);
router.post('/support-ticket/history', authUser, SupportTicketController.history);
router.post('/support-ticket/reply', authUser, SupportTicketController.reply);
router.post('/support-ticket/status', authUser, SupportTicketController.updateStatus);
router.post('/support-ticket/detail', authUser, SupportTicketController.getSupportTicket);

//  Category
router.post('/category/list', CategoryController.list);
router.post('/category/create', CategoryController.create);

// SubCategory
router.post('/sub-category/list', SubCategoryController.list);
router.post('/sub-category/create', SubCategoryController.create);

// Question
router.post('/question/list', QuestionController.list);
// router.post('/sub-category/create', SubCategoryController.create);

// Notification
router.post('/notification/list', authUser, NotificationController.list);
router.post('/notification/create', authUser, NotificationController.create);
// router.post('/notification/mark-read', NotificationController.markRead);

//----------------------------------------------

module.exports = router;
