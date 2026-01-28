const Constant = require('../config/Constant');

module.exports = {

    common: {
        success: 'Data found',
        found: 'Data found',
        notFound: 'Data not found',
        wrong: 'Oops! Something wend wrong. Please try again.',
    },

    qrCode: {
        generated: 'Qrcode generated.',
        notGenerated: 'Qrcode not generated.',
    },

    config: {
        notFound: 'Configuration not found.',
        detailsFound: 'Configuration details found.',
        planPeriodNotFound: 'Plan period is not valid.',
        levelBonusNotFound: 'Level bonus is not valid.',
        stakeValidationNotFound: 'Stake validation configuration not found.',

    },

    otp: {
        otpSend: 'OTP send successfully',
        otpNotMatch: 'OTP dose not match',
        otpVerified: 'OTP verified successfully',
        otpExpire: 'OTP expired'
    },

    password: {
        resetNew: 'Your password is expired please reset new password',
        passwordChange: 'Password changed successfully.',
        passwordSame: 'Your new password cannot be the same as your current password.',
        oldPasswordNotMatch: 'Old password does not match.',

    },

    twoFactorAuth: {
        qrGenerated: 'Qrcode generated.',
        tokenVerified: 'Token verified successfully.',
        tokenNotMatch: 'Token dose not match.',
        tokenResult: 'Token verification result.',

    },

    auth: {
        emailAlreadyExist: 'Email already exist.',
        phoneAlreadyExist: 'Phone already exist.',
        usernameAlreadyExist: 'Username already exist.',

        accountCreated: 'Your account has been created successfully.',

        credentialNotMatch: 'Your username and password do not match.',
        accountNotAccess: 'You are not allowed to access your account.',

        loginSuccess: 'Your have been successfully logged in.',

        logout: 'Your have been successfully logged out.',

        usernameNotFound: 'We cannot find an account with that username.',
        invalidReferralId: 'We cannot find an account with that sponsor id.',

        dependencyIssue: 'Something went wrong',
        notFound: 'Records not found',
        invalid: 'Invalid credentials',

    },

    userProfile: {
        usernameNotFound: 'We cannot find an account with that username.',
        coinWalletAddressNotFound: 'We cannot find an account with that wallet address.',
        walletAddressNotFound: 'We cannot find an account with that wallet address.',
        detailsFound: 'Profile details found.',

    },

    profile: {
        detailsFound: 'Profile details found.',
        detailsUpdated: 'Profile updated successfully.',
        profileImageSaved: 'Profile image saved successfully.',
        enable2fa: '2FA authentication enabled.',
        disable2fa: '2FA authentication disabled.',
        refresh: 'Profile refresh success',
        delete: 'Profile deleted',
        acceptConditions: 'Terms and conditions accepted',
        memorandumOfInformation: 'Memorandum of information accepted',
        freezed: `Your account is deactivated, stake with ${Constant.freezeReleaseOnStakeAmount} or more coins to reactivate, alternatively you can now only transfer coins to other accounts`,
        deactivating: 'Your account will be deactivated',
        deactivatingMsg: `Please stake immediately to continue account. You'll only be able to transfer coins after deactivation`,
        enableOtp: 'OTP authentication enabled.',
        disableOtp: 'OTP authentication disabled.',
        oldAndNewEmailSame: 'The old and new email addresses are the same. Please provide a different email address to update.',
        emailUpdated: 'Email updated successfully.',
    },

    wallet: {
        amountCredited: 'Amount credited',
        amountDebited: 'Amount debited',
        amountBePositive: 'Amount must be a positive number',
        amountBeNegative: 'Amount must be a negative number',
        amountNotValid: 'Amount value is not valid number',
        amountShouldBeOne: 'Stake value should be greater than 1',
        walletNotValid: 'You can\'t use this username for staking. Please change Id',
        insufficientBalance: 'You do no have sufficient balance to process this transaction',
        onlyOneRequestAllowed: 'Not eligible to request, you already did 1 transfer request',
        multiAttempts: 'Too many buy coin attempts',
        duplicateTransactionId: 'Duplicated transaction hash',

        invalidWalletAddress: 'Invalid wallet address',
        insufficientUsdtWalletAmount: 'Insufficient USDT Wallet Amount',
        insufficientUsdtWalletAmountForTransactionCharge: 'Insufficient USDT Wallet Amount for transaction charge',

        notEligible: 'Insufficient LBank Coins',

        transactionFound: 'Transactions found',
        transactionNotFound: 'You don\'t have any transactions',
        transactionsDetailsFound: 'Transaction details found',
        transactionsDetailsNotFound: 'You don\'t have any transaction details',

        transferSwapCoinSuccess: 'Coins transferred to stake wallet successfully',
        transferCompleted: 'Transfer complete',
        transferDenied: 'Transfer denied',
        transferFound: 'Transfer found',
        transferNotFound: 'You don\'t have any transfers',
        transferDetailsFound: 'Transfer Details found',
        transferDetailsNotFound: 'You don\'t have any transfer Details',
        transferSuspend: 'Transfer is temporary suspended.',
        transferInTeam: 'Transfer Rejected! You can transfer between your teams only.',
        transferValid: 'Transfer is valid.',
        isTransferConfirmation: true,
        transferSenderAlertMessage: 'I have received the amount from --USER-NAME-- in exchange of sending these coins.',
        transferReceiverAlertMessage: 'I have paid amount to --USER-NAME-- in exchange of receiving these coins.',

        swapWithdrawIsZero: 'Insufficient/Not eligible due to low limit',
        amountGreaterThanSwapAmountPer: 'Amount is greater than withdraw limit of your swap wallet part percent',
        swapWithdrawSuspend: 'Withdrawal for new coins is temporary suspended',
        withdrawDailyOnlyOne: 'You can daily create only one withdraw request.',
        withdrawMinAmount: 'The minimum withdrawal amount is ',
        withdrawMaxAmount: 'The maximum withdrawal for today amount is ',
        withdrawMaxAmountReferral: 'The maximum direct ref. withdrawal per day amount is ',
        withdrawRequestAlreadyPending: 'You have already withdraw request in progress, please wait for in progress transaction to be completed',
        withdrawRequestCreated: 'Withdrawal request created successfully',
        withdrawRequestFound: 'Withdraw request found',
        withdrawRequestNotFound: 'You don\'t have any withdraw request',
        withdrawRequestDetailsFound: 'Withdraw request details found',
        withdrawRequestDetailsNotFound: 'You don\'t have any withdraw request details',
        withdrawRequestCancel: 'Withdraw request canceled',
        withdrawRequestNotCancel: 'Withdraw request not canceled',
        withdrawMaxLimit: 'you reached to max daily withdrawal limit',
        withdrawSuspend: 'Withdraw is temporary suspended.',
        withdrawDisabled: 'Your withdrawal is suspended',
        withdrawRequestValid: 'Withdraw is valid.',

        withdrawNotEligible: 'Your withdraw suspended for a month due to lack of deposit/stakes',
        withdrawRules: 'Withdraw rules found',

        amountCoinBuyRequest: 'Buy coin request created successfully',
        amountCoinSwapRequest: 'Swap coin request created successfully',
        fetch: 'Profile fetched successfully',
        sameWallet: 'You can\'t withdraw to same wallet',

        maxWalletAddress: 'You have added the maximum withdraw wallet address.',
        walletAddressFound: 'Wallet address found',
        walletAddressSaved: 'Wallet address saved',
        walletAddressRemoved: 'Wallet address removed',
        walletAddressAlreadyExist: 'Wallet address already exist.',
        walletAddressAlreadyExistOtherUser: 'Wallet address already exist in other user profile',
        walletTransferToMsg: '*Use receiver\'s user Id from Fortune Machine App\'s profile',
        walletAddressValidation: 'Invalid wallet address. Please enter valid wallet address.',

        usdtTransactionSyncOnProgress: 'USDT transaction sync is complete',
    },

    stake: {
        stakeFound: 'Stake found.',
        stakeNotFound: 'You don\'t have any stake.',
        stakeCreated: 'Stake created successfully.',
        stakeDetailsFound: 'Stake details found.',
        stakeDetailsNotFound: 'You don\'t have any stake details.',
        stakeSuspend: 'Staking is temporary suspended.',
    },

    referralIncome: {
        found: 'Referral income found.',
        notFound: 'You don\'t have any referral income.',
        detailsFound: 'Referral income details found.',
        detailsNotFound: 'You don\'t have any referral income details.',
    },

    supportTicket: {
        create: 'Ticket created successfully',
        reply: 'Reply sent successfully',
        found: 'Records found',
        notFound: 'No records found',
        open: 'Ticket opened successfully',
        close: 'Ticket closed successfully',
        alreadyClosed: 'Ticket already closed',
    },

    teamMember: {
        dashboardDetails: 'Dashboard Details found.',
        found: 'Team Member found.',
        notFound: 'You don\'t have any team member.',

        groupListFound: 'Member group found.',
        levelNotFound: 'You don\'t have any level.',
        miningNotificationSend: 'Notification sent successfully',
    },

    dailyIncome: {
        found: 'Daily income records found',
        notFound: 'Daily income records not found',
        fileFound: 'File download success',
        fileNotFound: 'No records found, unable to download file',
        fileError: 'Something went wrong with file download',
    },

    allReward: {
        found: 'All reward records found',
        notFound: 'All reward records not found',
    },

    levelIncome: {
        found: 'Level income records found',
        notFound: 'Level income records not found'
    },
    bonusIncome: {
        found: 'Bonus income records found',
        notFound: 'Bonus income records not found'
    },
    withdrawal: {
        pending: 'Request pending',
        approval: 'Request approved',
        reject: 'Request rejected',
        success: 'Request success',
        failed: 'Request failed',
        cancelled: 'Request cancelled',
        invalid: 'Invalid entity',
        alreadyProcessed: 'Status already updated',
        requestProcessed: 'Request processed',
        notFound: 'Withdraw request not found',
        multiAttempts: 'Too many withdraw attempts',
    },

    notification: {
        found: 'Notification found',
        alreadySanded: 'User already notified for today',
    },

    tour: {
        eligible: 'Congratulations! You\'re eligible for this tour.',
        noOffer: 'Currently no offer available in this tour',
        detailsFound: 'Tour details found',
        detailsNotFound: 'Tour details not found',
        rewardApplied: 'Reward Applied',
    },

    cardRequest: {
        found: 'Card request found',
        notFound: 'Card request not found',
        detailsFound: 'Card details found',
        notActivated: 'Card not activated',


        cardRequestNotCreated: 'Card request not created',
        cardRequestCreated: 'Card request applied success',

        cardAddressNotEditable: 'Card delivery address not editable',
        cardAddressUpdated: 'Card delivery address updated',
        cardAddressNotUpdated: 'Card delivery address not updated',

        alreadyApplied: 'You already applied for this card',
        alreadyPaid: 'You already paid for this card',
        notPaid: 'You not paid for this card',
        emailAlreadyExist: 'Email already in used.',
        phoneAlreadyExist: 'Phone already in used.',

        cardPaymentCapture: 'Card payment capture',
        cardPaymentNotFound: 'Card payment request not found',
        cardPaymentNotCreated: 'Card order not created',
        cardPaymentCreated: 'Card order created',
        cardPaymentPaymentSuccess: 'Card payment success',
        cardPaymentPaymentFail: 'Card payment status update fail',
        cardPaymentPaymentNotUpdated: 'Card payment status noy updated',

        cardBindingSuccess: 'Card Details bindings successfully',
        cardUnbindingSuccess: 'Card Details unbinding successfully',
        cardBindingFail: 'Card Details not binding',

        kycBindingSuccess: 'KYC Details bindings successfully',
        kycBindingFail: 'KYC Details not binding',

        cardBalanceFail: 'Card balance not found',

        cardRechargeFail: 'Card recharge is failed',
        cardRechargeSuccess: 'Card recharge is successfully',

        cardApplicationStatus: 'Card Application Status Found',

        rechargeQrCode: `Scan this QR code and transfer Binance USD on it to top-up your card.`,
    },


    rewardCampaign: {
        found: 'Request found',
        notFound: 'Request not found',
        todaysRequestNotFound: 'Today\'s Request not found',
        todaysRequestFound: 'Today\'s Request found',
        applied: 'Request applied successfully',
        alreadyApplied: 'Request already applied for today',
        updated: 'Request updated successfully',
        alreadyRewarded: `coin added in your stake wallet`, // msg. Reward of 1 IFC coin added in your stake wallet
        title: 'Congratulations',
        description: 'coin added in your stake wallet'
    },


    exchangeOwnership: {
        found: 'Exchange ownership details found',
        notFound: 'Exchange ownership details not found',

        maxSharingReached: 'Sorry, Exchange Ownership Investment program has been closed.',

        passportUploadPlease: 'We have received your payment now please upload your national identity for verification to approve your request.',
        passportImageRequired: 'National identity image field must be required',
        passportNotUpload: 'National identity image not uploaded',
        passportUploadedSuccess: 'National identity image uploaded',

        paymentAdd: 'Payment added',
        paymentNotAdd: 'Payment not added',

        passportReviewing: 'Your national identity is under review',

        ownershipPaymentReceived: 'Your payment is received',
        ownershipRejected: 'Your national identity is rejected please upload valid national identity.',
        ownershipProcess: 'We have received your payment but your national identity is under review, we will review it and approve once verified.',
        ownershipEligible: 'Congratulations! You are now eligible for ownership of exchange investment program.',
    },

    usdtReward: {
        pending: 'Request pending',
        approval: 'Request approved',
        reject: 'Request rejected',
        success: 'Request success',
        failed: 'Request failed',
        cancelled: 'Request cancelled',
        invalid: 'Invalid entity',
        alreadyProcessed: 'Status already updated',
        requestProcessed: 'Request processed',
        multiAttempts: 'Too many withdraw attempts',
        found: 'USDT reward found',
        notFound: 'USDT reward not found',
        detailsFound: 'USDT reward details found',
        detailsNotFound: 'USDT reward details not found',
        pleaseAddUSDTWalletAddress: 'Please add USDT wallet address to claim',
        walletAddressAlreadyExists: 'Wallet address already exists',
        walletAddressAdded: 'Wallet address added',
        notFoundOrAlreadyClaimed: 'Reward not found or already claimed'
    },

    badge: {
        found: 'Badge details found',
        notFound: 'Badge details not found',
        uploaded: 'Badge Image Uploaded Success',
        failed: 'Something went wrong, at badge upload',
        requestReceived: 'Request received',
    },


    ifxDeposit: {
        paymentAdd: 'Payment added',
        paymentNotAdd: 'Payment not added',

        insufficientBalanceIfcCoin: 'You do not have sufficient exchange IFT Coin to process this transaction',
        insufficientBalanceIfxUsdt: 'You do not have sufficient USDT Balance to process this transaction',
        insufficientBalanceIfx: 'You do not have sufficient IFX Buy Coins to process this transaction',
        insufficientBalanceUsdt: 'You do not have sufficient IFC Buy Coins to process this transaction',

        usdtToIfxConvertSuccess: 'IFX Coins Added',
        ifxTransactionSyncOnProgress: 'IFX transaction sync is complete',
    },

    usdtDeposit: {
        paymentAdd: 'Payment added',
        paymentNotAdd: 'Payment not added',

        insufficientBalanceIfcCoin: 'You do not have sufficient exchange IFT Coin to process this transaction',
        insufficientBalanceIfXCoin: 'You do not have sufficient IFX Coin to process this transaction',
        insufficientBalanceIfcNewCoin: 'You do not have sufficient IFC Coin to process this transaction',
        insufficientBalanceUsdt: 'You do not have sufficient USDT Wallet to process this transaction',

        usdtConvertSuccess: 'USDT Coins Added',
        usdtTransactionSyncOnProgress: 'USDT transaction sync is complete',
    },

    ifcDeposit: {
        transactionSyncOnProgress: 'IFC transaction sync is complete',
    },

};

