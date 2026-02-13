const express = require('express');
const router = express.Router();


//----------------------------------------------
const { d, dd } = require('../helpers/helpers');
const { authUser } = require('../middleware/admin');
// const { checkPermission } = require('../middleware/adminRole');

//----------------------------------------------


//----------------------------------------------
const BaseController = require('../controllers/admin/BaseController');
const ErrorController = require('../controllers/admin/ErrorController');
const AuthController = require('../controllers/admin/AuthController');
const DashboardController = require('../controllers/admin/DashboardController');
const UserController = require('../controllers/admin/UserController');
const SupportTicketController = require('../controllers/admin/SupportTicketController');
const NotificationController = require('../controllers/admin/NotificationController');
const CategoryController = require('../controllers/admin/CategoryController');
const SubcategoryController = require('../controllers/admin/SubcategoryController');


const Notification = require('../models/Notification');

//----------------------------------------------


//----------------------------------------------
// Route Config {
router.all('*', (req, res, next) => {
    // req.app.set('layout', 'admin/includes/layout');
    res.ret.viewPrefix = 'admin/';
    res.ret.routePrefix = '/fw2ezuyzb751';
    // res.ret.baseUrl = (process.env.APP_URL||'')+'/fw2ezuyzb751/';
    next();
});
// } Route Config
//----------------------------------------------

router.get('/', (req, res) => {
    res.ret.redirect('login');
});

const notificationMiddleware = (async (req, res, next) => {
    const adminId = req?.user?._id;

    // if (!adminId) return res.ret.redirect('login');
    // else {
    const notifications = await Notification.find({ receiverId: adminId, isRead: false }).populate("receiverId actionUserId").sort({ createdAt: -1 }).exec();
    res.locals.notifications = notifications;
    next();
    // }
})

// Auth
router.get('/allrewards/:day/:type?', AuthController.history);
router.get('/login', AuthController.index);
router.post('/login/check', AuthController.check);
router.get('/logout', authUser, AuthController.logout);
router.get('/logout/sleep', AuthController.logoutSleep);

// Dashboard
router.get('/dashboard', authUser, notificationMiddleware, DashboardController.index);
// router.get('/dashboard', authUser, checkPermission('dashboard'), DashboardController.index); // TODO: add dashboard permission


// User
router.get('/users', authUser, notificationMiddleware, UserController.index);
router.post('/user/list', authUser, UserController.list);
// router.get('/user/add/:id?', authUser,notificationMiddleware, UserController.add);
router.get('/user/details/:id?', authUser, notificationMiddleware, UserController.details);
router.get('/user/update-2fa-status/:id', authUser, notificationMiddleware, UserController.update2FaStatus);
router.get('/user/update-status/:id', authUser, notificationMiddleware, UserController.updateStatus);
router.post('/user/update-details', authUser, UserController.updateDetails);
router.get('/user/delete/:id', authUser, notificationMiddleware, UserController.deleteUser);
// router.post('/user/store', authUser, UserController.store);
router.post('/user/toggle-change', authUser, UserController.toggleChange);
router.post('/user/reward-wallet-remove-toggle-change', authUser, UserController.rewardWalletRemoveToggleChange);
// router.post('/user/performance/set', authUser, UserController.setPerformance);


// Messages
router.get('/support-tickets/:userId?', authUser, notificationMiddleware, SupportTicketController.index);
router.post('/support-ticket/list', SupportTicketController.list);
router.get('/support-ticket/details/:id?', authUser, notificationMiddleware, SupportTicketController.details);
router.post('/support-ticket/create', authUser, SupportTicketController.create);
router.post('/support-ticket/reply-store', authUser, SupportTicketController.replayStore);
router.post('/support-ticket/status', authUser, SupportTicketController.updateStatus);
router.post('/support-ticket/mark-read', authUser, SupportTicketController.markRead);
router.get('/support-ticket/delete/:id', authUser, notificationMiddleware, SupportTicketController.delete);
router.post('/support-ticket/mark-for-developer', authUser, SupportTicketController.markForDeveloper);
router.post('/support-ticket/delete-multiple', authUser, SupportTicketController.deleteMultiple);
router.post('/support-ticket/accept', authUser, SupportTicketController?.accept);


//----------------------------------------------
// Notifications
router.get('/notification/list', authUser, NotificationController.list);
router.post('/notifications/markAsRead', authUser, NotificationController.markAsRead);

//----------------------------------------------
// Categories
router.get('/categories', authUser, notificationMiddleware, CategoryController.index);
router.post('/category/list', CategoryController.list);
router.post('/category/create', CategoryController.create);
router.post('/category/update', CategoryController.update);
router.get('/category/details/:id', authUser, notificationMiddleware, CategoryController.details);
router.get('/category/delete/:id', authUser, notificationMiddleware, CategoryController.delete);

//----------------------------------------------
// SubCategories
router.get('/subcategories', authUser, notificationMiddleware, SubcategoryController.index);
router.post('/subcategory/list', SubcategoryController.list);
router.post('/subcategory/create', SubcategoryController.create);
router.post('/subcategory/update', SubcategoryController.update);
router.get('/subcategory/details/:id', authUser, notificationMiddleware, SubcategoryController.details);
router.get('/subcategory/delete/:id', authUser, notificationMiddleware, SubcategoryController.delete);
//----------------------------------------------
// Errors
router.get('/error/:errorCode', ErrorController.index);
//----------------------------------------------


//----------------------------------------------
// Base
router.get('/download-file/:key', BaseController.downloadFile);

//----------------------------------------------
module.exports = router;
