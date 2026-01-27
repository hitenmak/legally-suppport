const express = require('express');
const router = express.Router();


//----------------------------------------------
const { d, dd } = require('../helpers/helpers');
const { authUser, authBasic } = require('../middleware/api');
// const { rateVeryLow, rateLow, rateMedium, rateHigh, rateVeryHigh } = require('../middleware/rateLimite');
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
const AllRewardController = require('../controllers/api/AllRewardController');
const DailyIncomeController = require('../controllers/api/DailyIncomeController');
const LevelIncomeController = require('../controllers/api/LevelIncomeController');
const BonusIncomeController = require('../controllers/api/BonusIncomeController');
const NotificationController = require('../controllers/api/NotificationController');
const TourController = require('../controllers/api/TourController');
const CardRequestController = require('../controllers/api/CardRequestController');

//----------------------------------------------

router.post('/card/update-payment-status', CardRequestController.updatePaymentStatus); // TODO: temp - hyperpay end point
router.post('/card/update-kyc-status', CardRequestController.updateKycStatus); // TODO: temp - hyperpay end point

//----------------------------------------------
// Route Config {
/*router.all('*', (req, res, next) => {
    return res.status(502).send('502 - Server Under Maintenance');
});*/
// } Route Config
//----------------------------------------------


//----------------------------------------------
// MIDDLEWARE - Authorization {
// router.all('*', authUser);
// } MIDDLEWARE - Authorization
//----------------------------------------------

// For income calculate {
// const RunCron = require('../models/seeders/runCron');
// router.get('/x-run-cron', RunCron.index);
// router.post('/run-cron/:addDays', RunCron.index);
// } For income calculate


// Config
router.get('/config/get', ConfigController.details);
router.get('/config/get-trade-price', ConfigController.getTradePrice);
router.get('/config/offer', ConfigController.coinOffer);


// Web Config
router.get('/web/config', WebConfigController.details);

// Dashboard
router.all('/dashboard', authUser, DashboardController.details);
router.get('/dashboard/team', authUser, DashboardController.teamDetails);


// Auth
router.post('/register', AuthController.register);
router.post('/register/check-user', AuthController.checkUser);
router.post('/login', AuthController.login);
router.post('/logout', authUser, AuthController.logout);

router.post('/otp/resend', authUser, AuthController.otpResend);
router.post('/otp/verify', authUser, AuthController.otpVerify);

router.post('/password/forgot', AuthController.forgotPassword);
router.post('/password/set', authUser, AuthController.setPassword);
router.post('/password/change', authUser, AuthController.changePassword);


// 2FA Auth
router.get('/two-factor-auth/qrcode', authUser, AuthController.twoFactorAuthQrcode);
router.post('/two-factor-auth/verify', authUser, AuthController.twoFactorAuthVerify);
router.post('/two-factor-auth/status', authUser, AuthController.twoFactorAuthStatus);


// Profile
router.get('/profile/details', authUser, ProfileController.details);
router.post('/profile/update', authUser, ProfileController.detailsUpdate);
router.post('/profile/update-image', authUser, ProfileController.detailsUpdateImage);
router.get('/profile/refresh', authUser, ProfileController.refreshDate);
router.post('/profile/delete', authUser, ProfileController.deleteProfile);
router.post('/profile/accept-terms-conditions', authUser, ProfileController.acceptTermsConditions);


// Wallet Coin

// router.post('/coin/buy', authUser, BuyCoinController.buy);
router.get('/coin/get-qrcode', authUser, BuyCoinController.getQrcode);
router.post('/coin/history', authUser, BuyCoinController.history);
router.post('/coin/details', authUser, BuyCoinController.details);


// Wallet Transfer
router.post('/wallet-transfer/create', authUser, WalletTransferController.create);
router.post('/wallet-transfer/history', authUser, WalletTransferController.history);
router.post('/wallet-transfer/details', authUser, WalletTransferController.details);

router.post('/wallet-transfer/check-user', authUser, WalletTransferController.checkUser);
router.post('/wallet-transfer/send-otp', authUser, WalletTransferController.sendOtp);


// Withdraw Request
router.post('/withdraw-request/create', authUser, WithdrawRequestController.create);
router.post('/withdraw-request/history', authUser, WithdrawRequestController.history);
router.post('/withdraw-request/details', authUser, WithdrawRequestController.details);
// router.post('/withdraw-request/cancel', authUser, WithdrawRequestController.cancel);

router.post('/withdraw-request/send-otp', authUser, WithdrawRequestController.sendOtp);
router.post('/withdraw-request/get-set-wallet-address', authUser, WithdrawRequestController.getSetWalletAddress);


// Stacking
router.post('/stake/create', authUser, StakeController.create);
router.post('/stake/history', authUser, StakeController.history);
// router.post('/stake/details', authUser, StakeController.details);


// Direct Referral Income
router.post('/direct-referral-income/history', authUser, DirectReferralIncomeController.history);
router.post('/direct-referral-income/details', authUser, DirectReferralIncomeController.details);


// Support Ticket
router.post('/support-ticket/create', authUser, SupportTicketController.create);
router.post('/support-ticket/history', authUser, SupportTicketController.history);
router.post('/support-ticket/reply', authUser, SupportTicketController.reply);
router.post('/support-ticket/status', authUser, SupportTicketController.updateStatus);
router.post('/support-ticket/detail', authUser, SupportTicketController.getSupportTicket);


// Team Member
router.post('/team-member/group-list', authUser, TeamMemberController.groupList);
router.post('/team-member/level-team-members', authUser, TeamMemberController.levelTeamMembers);
router.post('/team-member/count-dashboard', authUser, TeamMemberController.countDashboard);
router.post('/team-member/mining-notification', authUser, TeamMemberController.miningNotification);


// Media Post
router.get('/media-post/advertisement-banner', authUser, MediaPostController.advertisementBanner);


// Rewards
router.get('/wallet', authUser, RewardController.fetch);


// All Reward
router.post('/all-reward/history', authUser, AllRewardController.history);


// Daily Income
router.post('/daily-income/history', authUser, DailyIncomeController.history);
router.post('/daily-income/download', authUser, DailyIncomeController.download);


// Level Income
router.post('/level-income/history', authUser, LevelIncomeController.history);


// Bonus Income
router.post('/bonus-income/history', authUser, BonusIncomeController.history);


// Notification
router.post('/notification/history', authUser, NotificationController.history);


// Tour
router.post('/tour/details', TourController.details);


// Card Request
router.post('/card/details', authUser, CardRequestController.details);
router.post('/card/request', authUser, CardRequestController.create);
router.post('/card/create-payment', authUser, CardRequestController.createPayment);
router.get('/card/payment-redirect/:key?', CardRequestController.paymentRedirect);

// router.post('/card/update-payment-status', CardRequestController.updatePaymentStatus); // hyperpay end point
// router.post('/card/update-kyc-status', CardRequestController.updateKycStatus); // hyperpay end point

router.post('/card/card-binding', authUser, CardRequestController.cardBinding);
router.post('/card/kyc-binding', authUser, CardRequestController.kycBinding);


//----------------------------------------------

module.exports = router;
