const express = require('express');
const router = express.Router();


//----------------------------------------------
const { d, dd } = require('../helpers/helpers');
const { authUser, authBasic } = require('../middleware/api');
const { rateVeryLow, rateLow, rateMedium, rateHigh, rateVeryHigh } = require('../middleware/rateLimite');
//----------------------------------------------


//----------------------------------------------
const ConfigController = require('../controllers/api/ConfigController');
const WebConfigController = require('../controllers/api/WebConfigController');
const DashboardController = require('../controllers/api/DashboardController');
const AuthController = require('../controllers/api/AuthController');
const ProfileController = require('../controllers/api/ProfileController');
const BuyCoinController = require('../controllers/api/BuyCoinController');
const WalletTransferController = require('../controllers/api/WalletTransferController');
const WithdrawRequestController = require('../controllers/api/WithdrawRequestController');
const StakeController = require('../controllers/api/StakeController');
const DirectReferralIncomeController = require('../controllers/api/DirectReferralIncomeController');
const SupportTicketController = require('../controllers/api/SupportTicketController');
const TeamMemberController = require('../controllers/api/TeamMemberController');
const RewardController = require('../controllers/api/RewardController');
const MediaPostController = require('../controllers/api/MediaPostController');
const DailyIncomeController = require('../controllers/api/DailyIncomeController');
const LevelIncomeController = require('../controllers/api/LevelIncomeController');
const BonusIncomeController = require('../controllers/api/BonusIncomeController');

//----------------------------------------------


//----------------------------------------------
// Route Config {
router.all('*', (req, res, next) => {
    res.ret.viewPrefix = 'admin/includes/layout';
    res.ret.routePrefix = '/fw2ezuyzb751';
    next();
});
// } Route Config
//----------------------------------------------


//----------------------------------------------
// MIDDLEWARE - Authorization {
// router.all('*', authUser);
// } MIDDLEWARE - Authorization
//----------------------------------------------


// Config
router.get('/config/get', rateLow(), ConfigController.details);
router.get('/config/get-trade-price', ConfigController.getTradePrice);
router.get('/config/offer', rateLow(), ConfigController.coinOffer);


// Web Config
router.get('/web/config', rateLow(), WebConfigController.details);

// Dashboard
router.get('/dashboard', rateMedium(), authUser, DashboardController.details);
router.get('/dashboard/team', rateMedium(), authUser, DashboardController.teamDetails);


// Auth
router.post('/register', rateVeryLow(), AuthController.register);
router.post('/register/check-user', rateVeryHigh(), AuthController.checkUser);
router.post('/login', rateVeryLow(), AuthController.login);

router.post('/otp/resend', rateLow(), authUser, AuthController.otpResend);
router.post('/otp/verify', rateLow(), authUser, AuthController.otpVerify);

router.post('/password/forgot', rateVeryLow(), AuthController.forgotPassword);
router.post('/password/set', rateVeryLow(), authUser, AuthController.setPassword);
router.post('/password/change', rateVeryLow(), authUser, AuthController.changePassword);


// 2FA Auth
router.get('/two-factor-auth/qrcode', rateVeryLow(), authUser, AuthController.twoFactorAuthQrcode);
router.post('/two-factor-auth/verify', rateVeryLow(), authUser, AuthController.twoFactorAuthVerify);
router.post('/two-factor-auth/status', rateVeryLow(), authUser, AuthController.twoFactorAuthStatus);


// Profile
router.get('/profile/details', rateMedium(), authUser, ProfileController.details);
router.post('/profile/update', rateLow(), authUser, ProfileController.detailsUpdate);
router.post('/profile/update-image', rateLow(), authUser, ProfileController.detailsUpdateImage);
router.get('/profile/refresh', rateVeryLow(), authUser, ProfileController.refreshDate);
router.post('/profile/delete', rateVeryLow(), authUser, ProfileController.deleteProfile);
router.post('/profile/accept-terms-conditions', rateVeryLow(), authUser, ProfileController.acceptTermsConditions);


// Wallet Coin
// router.post('/coin/buy', rateLow(), authUser, BuyCoinController.buy);
router.get('/coin/get-qrcode', rateMedium(), authUser, BuyCoinController.getQrcode);
router.post('/coin/history', rateHigh(), authUser, BuyCoinController.history);
router.post('/coin/details', rateMedium(), authUser, BuyCoinController.details);


// Wallet Transfer
router.post('/wallet-transfer/create', rateLow(), authUser, WalletTransferController.create);
router.post('/wallet-transfer/history', rateHigh(), authUser, WalletTransferController.history);
router.post('/wallet-transfer/details', rateMedium(), authUser, WalletTransferController.details);

router.post('/wallet-transfer/check-user', rateLow(), authUser, WalletTransferController.checkUser);
router.post('/wallet-transfer/send-otp', rateLow(), authUser, WalletTransferController.sendOtp);


// Withdraw Request
router.post('/withdraw-request/create', rateLow(), authUser, WithdrawRequestController.create);
router.post('/withdraw-request/history', rateHigh(), authUser, WithdrawRequestController.history);
router.post('/withdraw-request/details', rateMedium(), authUser, WithdrawRequestController.details);
router.post('/withdraw-request/cancel', rateLow(), authUser, WithdrawRequestController.cancel);

router.post('/withdraw-request/send-otp', rateLow(), authUser, WithdrawRequestController.sendOtp);


// Stacking
router.post('/stake/create', rateLow(), authUser, StakeController.create);
router.post('/stake/history', rateHigh(), authUser, StakeController.history);
// router.post('/stake/details', rateMedium(), authUser, StakeController.details);


// Direct Referral Income
router.post('/direct-referral-income/history', rateHigh(), authUser, DirectReferralIncomeController.history);
router.post('/direct-referral-income/details', rateMedium(), authUser, DirectReferralIncomeController.details);


// Support Ticket
router.post('/support-ticket/create', rateLow(), authUser, SupportTicketController.create);
router.post('/support-ticket/history', rateHigh(), authUser, SupportTicketController.history);
router.post('/support-ticket/reply', rateLow(), authUser, SupportTicketController.reply);
router.post('/support-ticket/status', rateLow(), authUser, SupportTicketController.updateStatus);
router.post('/support-ticket/detail', rateMedium(), authUser, SupportTicketController.getSupportTicket);


// Team Member
router.post('/team-member/group-list', rateHigh(), authUser, TeamMemberController.groupList);
router.post('/team-member/level-team-members', rateMedium(), authUser, TeamMemberController.levelTeamMembers);
router.post('/team-member/count-dashboard', rateMedium(), authUser, TeamMemberController.countDashboard);


// Media Post
router.get('/media-post/advertisement-banner', rateMedium(), authUser, MediaPostController.advertisementBanner);


// Rewards
router.get('/wallet', rateMedium(), authUser, RewardController.fetch);


// Daily Income
router.post('/daily-income/history', rateHigh(), authUser, DailyIncomeController.history);
router.post('/daily-income/download', rateMedium(), authUser, DailyIncomeController.download);


// Level Income
router.post('/level-income/history', rateHigh(), authUser, LevelIncomeController.history);


// Bonus Income
router.post('/bonus-income/history', rateHigh(), authUser, BonusIncomeController.history);


//----------------------------------------------

module.exports = router;
