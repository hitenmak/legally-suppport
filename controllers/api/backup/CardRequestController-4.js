const crypto = require('crypto');
const axios = require('axios');

// Models
const CardRequest = require('../../models/CardRequest');
const CardRequestPaymentHistory = require('../../models/CardRequestPaymentHistory');

// Helpers
const { d, dd, de, empty, checkValidation, getBool, getStr, getVal, getNum, formatNumber, formatReqFiles, flipOnKey, getBase64FromUrl, formatBytes, capitalizeFirstLetter, isEqual, ex, getDateFormat, ddm, makeList, newObjectId, toObjectId } = require('../../helpers/helpers');
const MakeData = require('../../helpers/makeData');
const DataManipulate = require('../../helpers/dataManipulate');
const Msg = require('../../messages/api');

const Media = require('../../infrastructure/Media/Media');
const Constant = require('../../config/Constant');


//---------------------------------------------------------------------------------------------
// Helper
const bindCard = async (cardRequestDetails) => {
    return new Promise(async (resolve, reject) => {
        let errorThrowKey = 'default';
        let errorCode = '44444';
        const errorMessages = {
            'default': Msg.cardRequest.cardBindingFail,
            'record-not-saved': Msg.cardRequest.cardBindingFail,
            'api-response-error': Msg.cardRequest.cardBindingFail,
            'api-order-data-error': Msg.cardRequest.cardBindingFail,
        };
        try {


            const hyperPayConfig = Constant.hyperPay;
            const version = hyperPayConfig.apiVersion;
            const timestamp = Math.floor(Date.now() / 1000);

            const cardBindingPayload = {
                card_no: getStr(cardRequestDetails.cardNo),
                envelope_no: getStr(cardRequestDetails.envelopeNo),
                mc_trade_no: cardRequestDetails._id + '',
                user_identifier: getStr(cardRequestDetails.email)
            };

            const message = `api-key=${process.env.HYPERPAY_API_KEY}&card_no=${cardBindingPayload.card_no}&envelope_no=${cardBindingPayload.envelope_no}&mc_trade_no=${cardBindingPayload.mc_trade_no}&nonce=${process.env.HYPERPAY_NONCE}&timestamp=${timestamp}&user_identifier=${cardBindingPayload.user_identifier}&version=${version}`;

            const sign = crypto.createSign('RSA-SHA256');
            sign.update(message);
            const signature = sign.sign(process.env.HYPERPAY_PRIVATE_KEY.split(String.raw`\n`).join('\n'), 'base64');

            const headers = { 'api-key': process.env.HYPERPAY_API_KEY, nonce: process.env.HYPERPAY_NONCE, timestamp, signature, version };

            axios.post(`${process.env.HYPERPAY_CARD_API_URL}/openapi/card/binding`, cardBindingPayload, { headers }).then(async (cardBindingRes) => {
                cardBindingRes = cardBindingRes?.data || {};
                dd(cardBindingRes, 'cardBindingRes Original');
                cardBindingRes = { code: '00000', msg: 'ok' };
                // dd(cardBindingRes, 'cardBindingRes1')
                if (empty(cardBindingRes?.code) || cardBindingRes?.code !== '00000') {
                    errorThrowKey = 'api-response-error';
                    errorCode = cardBindingRes?.code;
                    errorMessages[errorThrowKey] = cardBindingRes?.msg || '';
                    throw new Error(errorThrowKey);
                }
                // Update Details {
                const cardRequestDetailsUpdated = await CardRequest.findOneAndUpdate(
                    { _id: cardRequestDetails._id, },
                    { $set: { cardBindingAt: new Date(), cardStatus: 6, } },
                    { new: true },
                ).exec();
                if (empty(cardRequestDetailsUpdated)) throw new Error(errorThrowKey);
                // } Update Details

                dd(cardBindingRes, 'cardBindingRes-');
                resolve(cardBindingRes);

            }).catch((e) => {
                de(`ERR IN: card order request api - id: card request id: ${cardRequestDetails._id}`);
                de(errorThrowKey);
                de(e);
                // CardRequest.update({ _id: cardRequestRecord._id }, { $pull: { 'cardPayment': { _id: cardPaymentId } } }).exec();
                resolve({ code: errorCode, msg: errorMessages[errorThrowKey] });
                // ret.sendFail(errorMessages[errorThrowKey]);
            });
        } catch (e) {
            de('try-catch-binding');
            de(e);
            resolve({ code: errorCode, msg: Msg.cardRequest.cardBindingFail });
        }
    });
};


//---------------------------------------------------------------------------------------------

// Check card details and status 0
exports.details = async (req, res) => {

    const ret = res.ret;
    const _user = req._user;
    const reqData = req.body;

    try {
        const resData = await DataManipulate.cardRequestDetails(_user._id);

        ret.send(!empty(resData), resData, empty(resData) ? Msg.cardRequest.notFound : Msg.cardRequest.found);

    } catch (e) {
        de(e);
        ret.err500();
    }
};


// Create card request 1st
exports.create = async (req, res) => {
    // https://doc-api.hyperpay.io/en/2api/21_hypercard_api/2132_application_basic_v4.html

    const ret = res.ret;
    const _user = req._user;

    let errorThrowKey = 'default';
    const errorMessages = {
        'default': Msg.cardRequest.cardRequestNotCreated,
        'record-not-saved': Msg.cardRequest.cardRequestNotCreated,
        'image-not-convert-base64': Msg.cardRequest.cardRequestNotCreated,
        'api-response-error': Msg.cardRequest.cardRequestNotCreated,
    };

    try {
        Media.storeCardAttachment('frontDoc,mixDoc,signImg')(req, res, async (err) => {

            req = formatReqFiles(req);
            const reqData = { ...req.body, ...(req.files || {}) };
            const hyperPayConfig = Constant.hyperPay;

            // Check validation {
            const isInvalid = checkValidation(reqData, {
                email: 'required | email | maxlength: 64',                                                  // email: (string)[true]   | Email；Maximum 64 characters. Not support "@163.com"
                firstName: 'required | maxlength: 50',                                                      // first_name: (string)[true]   | First name；Maximum 50 characters
                lastName: 'required | maxlength: 50',                                                       // last_name: (string)[true]   | First name；Maximum 50 characters
                mobile: 'required | minlength: 6 | maxlength: 11',                                          // mobile: (string)[true]   | Mobile no；Minimum 6 characters and Maximum 11 characters
                mobileCode: 'required | maxlength: 5',                                                      // mobile_code:	(string)[true]   | Mobile no country code；Maximum 5 characters
                address: 'required | maxlength: 256',                                                       // address: (string)[true]   | Mailing address，Card will sending to this address；Maximum 256 characters
                birthday: 'required | date: past',                                                          // birthday: (string)[true]   | Date of birth, format: yyyy-MM-dd
                city: 'required | maxlength: 100',                                                          // city: (string)[true]   | City；Maximum 100 characters
                countryId: `required | in: ${Object.keys(hyperPayConfig.countryId).join(',')}`,             // country_id: (integer)[true]   | Country ID，Refer to the appendix【3.2 Mobile Phone Area Code and Country Code】-【Unique ID】for the range of values
                emergencyContact: 'required | maxlength: 255',                                              // emergency_contact: (string)[true]   | Emergency contact person；Maximum 255 characters
                gender: `required | in: ${hyperPayConfig.gender.join(',')}`,                                // gender: (integer)[true]   | Gender:1 Male; 2 Female
                nationalityId: `required | in: ${Object.keys(hyperPayConfig.countryId).join(',')}`,         // nationality_id: (integer)[true]   | Nationality ID，Refer to the appendix【3.2 Mobile Phone Area Code and Country Code】-【Unique ID】for the range of values
                state: 'required | maxlength: 100',                                                         // state: (string)[true]   | State；Maximum 100 characters
                zipCode: 'required | maxlength: 20',                                                        // zip_code: (string)[true]   | Postal Code；Maximum 20 characters Same set as mobile no country code
                // sign_img: (string)[true]  | Photo of signature；Encoded into base64 format. The size of this field should be less than 1 MB. Support：jpg,jpeg,png
            });
            if (isInvalid) return ret.sendFail(isInvalid);
            // } Check validation

            // Check Unique {
            if (await CardRequest.countDocuments({ userId: _user._id })) return ret.sendFail(Msg.cardRequest.alreadyApplied);
            if (await CardRequest.countDocuments({ email: reqData.email })) return ret.sendFail(Msg.cardRequest.emailAlreadyExist);
            if (await CardRequest.countDocuments({ mobile: reqData.mobile })) return ret.sendFail(Msg.cardRequest.phoneAlreadyExist);
            // } Check Unique


            const currentCardType = hyperPayConfig.cardType[0];
            // Create Card Record {
            const newRecord = new CardRequest;
            newRecord.userId = _user._id;
            newRecord.cardTypeId = getStr(currentCardType.id);
            newRecord.cardTypeName = getStr(currentCardType.type);
            newRecord.email = getStr(reqData.email);
            newRecord.firstName = getStr(reqData.firstName);
            newRecord.lastName = getStr(reqData.lastName);
            newRecord.mobile = getStr(reqData.mobile);
            newRecord.mobileCode = getStr(reqData.mobileCode);
            newRecord.address = getStr(reqData.address);
            newRecord.birthday = getVal(reqData.birthday);
            newRecord.city = getStr(reqData.city);
            newRecord.countryId = getNum(hyperPayConfig.countryId[reqData.countryId]);

            newRecord.emergencyContact = getStr(reqData.emergencyContact);
            newRecord.gender = getNum(reqData.gender);
            newRecord.nationalityId = getNum(hyperPayConfig.countryId[reqData.nationalityId]);
            newRecord.state = getStr(reqData.state);
            newRecord.zipCode = getStr(reqData.zipCode);


            newRecord.save().then(async record => {
                if (empty(record)) {
                    errorThrowKey = 'record-not-saved';
                    return ret.throw(errorThrowKey);
                }

                const resData = MakeData.cardRequestDetails(record);

                ddm(resData, 'resData card');
                ret.sendSuccess(resData, Msg.cardRequest.cardRequestCreated);


            }).catch(e => {
                de('ERR IN: card record create - id: ' + newRecord._id);
                de(errorThrowKey);
                de(e);
                CardRequest.findByIdAndDelete(newRecord._id).exec();
                ret.sendFail(errorMessages[errorThrowKey]);
            });
            // } Create Card Record
        });
    } catch (e) {
        de('try-catch');
        de(errorThrowKey);
        de(e);
        ret.sendFail(errorMessages[errorThrowKey]);
    }
};


// Create card payment 2nd
exports.createPayment = async (req, res) => {

    const ret = res.ret;
    const _user = req._user;
    const reqData = req.body;

    let errorThrowKey = 'default';
    const errorMessages = {
        'default': Msg.cardRequest.cardPaymentNotCreated,
        'record-not-saved': Msg.cardRequest.cardPaymentNotCreated,
        'api-response-error': Msg.cardRequest.cardPaymentNotCreated,
        'api-order-data-error': Msg.cardRequest.cardPaymentNotCreated,
    };
    let cardPaymentId = newObjectId();
    try {

        const hyperPayConfig = Constant.hyperPay;
        const version = hyperPayConfig.apiVersion;
        const timestamp = Math.floor(Date.now() / 1000);
        const language = hyperPayConfig.language;
        const merchantOrderId = cardPaymentId; // merchantOrderId: is card order id (subdoc id)
        const paymentReturnUrl = hyperPayConfig.cardPaymentResponse + merchantOrderId;
        currentCardTypeData = hyperPayConfig.cardType[0];


        // Find Card Request {
        const cardRequestRecord = await CardRequest.findOne({ userId: _user._id }).exec();
        if (empty(cardRequestRecord)) return ret.sendFail(Msg.cardRequest.notFound);

        if (await CardRequest.countDocuments({ userId: _user._id, remainingAmount: { $lte: 0 } }).exec()) return ret.sendFail(Msg.cardRequest.alreadyPaid);
        // } Find Card Request

        if (empty(cardRequestRecord.totalAmount)) {
            cardRequestRecord.totalAmount = getNum(currentCardTypeData.cardFeeAmount);
            cardRequestRecord.remainingAmount = getNum(currentCardTypeData.cardFeeAmount);
        }
        /*cardRequestRecord = await CardRequest.findOneAndUpdate(
            { _id: cardRequestRecord._id},
            { $set: { totalAmount: getNum(hyperPayConfig.cardPaymentAmount), remainingAmount: getNum(hyperPayConfig.cardPaymentAmount)} },
            { new: true },
        ).exec();
        if (empty(cardRequestRecord)) {
            errorThrowKey = 'record-not-saved';
            return ret.throw(errorThrowKey);
        }*/

        const newOrderRecord = {
            _id: cardPaymentId,
            amount: cardRequestRecord.remainingAmount,
            timestamp: getNum(timestamp),
        };

        if (empty(cardRequestRecord.cardPayment)) cardRequestRecord.cardPayment = [];
        cardRequestRecord.cardPayment.push(newOrderRecord);

        // Create Order Record {
        cardRequestRecord.save().then(async record => {
            if (empty(record) || empty(record.remainingAmount)) {
                errorThrowKey = 'record-not-saved';
                return ret.throw(errorThrowKey);
            }

            // Create Payment Link {

            const message = `amount=${cardRequestRecord.remainingAmount}&app_id=${process.env.HYPERPAY_APP_ID}&currency=${hyperPayConfig.cardPaymentCurrency}&lang=${language}&merchant_order_id=${merchantOrderId}&return_url=${paymentReturnUrl}&time=${timestamp}&version=${version}`;

            const sign = crypto.createSign('md5WithRSAEncryption');
            sign.update(message);
            const signature = sign.sign(process.env.HYPERPAY_ORDER_PRIVATE_KEY.split(String.raw`\n`).join('\n'), 'base64');

            let orderCreatePayload = {
                'amount': cardRequestRecord.remainingAmount,
                'app_id': process.env.HYPERPAY_APP_ID,
                'currency': hyperPayConfig.cardPaymentCurrency,
                'lang': language,
                'merchant_order_id': merchantOrderId,
                'return_url': paymentReturnUrl,
                'sign': signature,
                'time': timestamp,
                'version': version,

            };
            axios.post(`${process.env.HYPERPAY_ORDER_CREATE_API_URL}`, orderCreatePayload, { 'Content-Type': 'application/json; charset=utf-8' }).then(async (cardPaymentRes) => {

                cardPaymentRes = cardPaymentRes?.data || {};
                ddm(cardPaymentRes);
                if (empty(cardPaymentRes?.status) || empty(cardPaymentRes?.data) || cardPaymentRes?.status != 200) {
                    errorThrowKey = 'api-response-error';
                    errorMessages[errorThrowKey] = (cardPaymentRes?.msg || '') + ' - ' + cardPaymentRes?.status || '';
                    return ret.throw(errorThrowKey);
                }

                const cardPaymentData = cardPaymentRes.data || {};
                if (empty(cardPaymentData.merchant_order_id) || empty(cardPaymentData.expires_at) || empty(cardPaymentData.checkout_url)) {
                    errorThrowKey = 'api-order-data-error';
                    errorMessages[errorThrowKey] = ' Merchant Order Id, Expires At, Checkout Url not found - ' + cardPaymentRes?.status || '';
                    return ret.throw(errorThrowKey);
                }

                dd(cardPaymentData, 'cardPaymentData');
                CardRequest.findOneAndUpdate(
                    { _id: cardRequestRecord._id, 'cardPayment._id': cardPaymentId },
                    { $set: { 'cardPayment.$.orderNo': cardPaymentData.order_no, } }
                ).exec();

                /*response data: {
                    order_no: '0CHFPOMFBX',
                    merchant_order_id: '64ad4b353c83e4d9f3d4b035',
                    amount: '60',
                    currency: 'usd',
                    status: 0,
                    created_at: 1689078582,
                    expires_at: 1689080382,
                    addresses: [ [Object], [Object] ],
                    return_url: 'http://localhost:3001/api/hypercard/order-update/64b0fc0486cb8c63d1e38048',
                    checkout_url: 'https://h5test.hyperbc.pro/order/0CHFPOMFBX?lang=en'
                  }*/

                const resData = {
                    orderNo: getStr(cardPaymentData.order_no),
                    merchantOrderId: getStr(cardPaymentData.merchant_order_id),
                    expiresAt: getStr(cardPaymentData.expires_at),
                    checkoutUrl: getStr(cardPaymentData.checkout_url),
                };

                ret.sendSuccess(resData, Msg.cardRequest.cardPaymentCreated);
            }).catch((e) => {
                de(`ERR IN: card order request api - id: card request id: ${newOrderRecord._id} | order id: ${cardPaymentId}`);
                de(errorThrowKey);
                de(e);
                CardRequest.update({ _id: cardRequestRecord._id }, { $pull: { 'cardPayment': { _id: cardPaymentId } } }).exec();
                ret.sendFail(errorMessages[errorThrowKey]);
            });
            // } Create Payment Link

        }).catch(e => {
            de(`ERR IN: card order create - card request id: ${newOrderRecord._id} | order id: ${cardPaymentId}`);
            de(errorThrowKey);
            de(e);
            CardRequest.update({ _id: cardRequestRecord._id }, { $pull: { 'cardPayment': { _id: cardPaymentId } } }).exec();
            ret.sendFail(errorMessages[errorThrowKey]);
        });
        // } Create Order Record

    } catch (e) {
        de('try-catch');
        de(errorThrowKey);
        de(e);
        ret.sendFail(errorMessages[errorThrowKey]);
    }
};

// Payment Redirect
exports.paymentRedirect = async (req, res) => {

    const ret = res.ret;
    const key = req?.params?.key;
    try {
        ret.sendSuccess({}, Msg.cardRequest.cardPaymentCapture);
    } catch (e) {
        ret.err500(e);
    }
};

// Update card status from card api call back / end point from hyper pay
exports.updatePaymentStatus = async (req, res) => {

    // https://www.hyperbc.com/doc/api/en/#signature-regulations
    // https://www.hyperbc.com/doc/api/en/#h5-deposit-result-callback-notification
    const ret = res.ret;
    const reqData = req.body?.data || {};

    const hyperPayConfig = Constant.hyperPay;
    // const version = hyperPayConfig.apiVersion;
    // const timestamp = Math.floor(Date.now() / 1000);
    // const language = hyperPayConfig.language;

    // Api response default {

    const sendResponse = () => {
        const resStatus = 200;
        const resData = { success_data: 'success' };
        // const resMessage = `&app_id=${process.env.HYPERPAY_APP_ID}&data=${JSON.stringify(resData)}&lang=${language}&status=${resStatus}&time=${timestamp}&version=${version}`;
        const resMessage = `data=${JSON.stringify(resData)}&status=${resStatus}`;
        const resSign = crypto.createSign('md5WithRSAEncryption');
        resSign.update(resMessage);
        const resSignature = resSign.sign(process.env.HYPERPAY_ORDER_PRIVATE_KEY.split(String.raw`\n`).join('\n'), 'base64');
        return res.status(200).json({
            data: resData,
            sign: resSignature,
            status: resStatus,
        });
    };

    // } api response default

    ddm(reqData);
    try {

        CardRequestPaymentHistory.create({ data: req.body });

        // Check validation {
        const isInvalid = checkValidation(reqData, {
            order_no: 'required',
            merchant_order_id: 'required',
            status: 'required | number',
            payments: 'required',
        });
        if (isInvalid) return sendResponse(); // return ret.sendFail(isInvalid);
        // } Check validation


        // Find Card Request {
        const cardRequestDetails = await CardRequest.findOne({ 'cardPayment._id': reqData.merchant_order_id, 'cardPayment.orderNo': reqData.order_no, 'cardPayment.status': 0 }).exec();
        // ddm(cardRequestDetails);
        if (empty(cardRequestDetails)) return sendResponse(); // return ret.sendFail(Msg.cardRequest.cardPaymentNotFound);
        // } Find Card Request
        // return ret.sendSuccess(cardRequestDetails, Msg.cardRequest.cardPaymentPaymentSuccess);


        const paymentStatus = getNum(reqData.status); // 0: pending payment 1: completed 2: abnormal payment 10: cancelled
        const newRemainingAmount = getNum(cardRequestDetails.remainingAmount) - getNum(reqData.payments[0]?.amount || 0);
        const statusDateTime = newRemainingAmount <= 0 ? new Date() : null;
        const requestStatusData = {
            'cardPayment.$.isPaid': [1, 2].includes(paymentStatus),
            'cardPayment.$.status': paymentStatus,
            'cardPayment.$.pendingPayment': newRemainingAmount,
            'cardPayment.$.paymentsDetails': reqData.payments,
            remainingAmount: newRemainingAmount,
        };

        if (newRemainingAmount <= 0) {
            requestStatusData.paymentReceivedAt = statusDateTime;
            requestStatusData.confirmAt = statusDateTime;
            // requestStatusData.processingAt = statusDateTime; // TODO: temp
            // requestStatusData.dispatchedAt = statusDateTime; // TODO: temp
            // requestStatusData.deliveredAt = statusDateTime; // TODO: temp
            requestStatusData.cardStatus = 2;

        }

        const record = await CardRequest.findOneAndUpdate(
            // { 'cardPayment._id': orderId },
            { _id: cardRequestDetails._id, 'cardPayment.orderNo': reqData.order_no },
            // { $set: { 'cardPayment.$.isPaid': true, paymentReceivedAt: new Date(), cardStatus: 1, } },
            { $set: requestStatusData },
            { new: true }
        ).exec();
        if (empty(record)) return sendResponse(); // return ret.throw('payment-not-updated');

        // const resData = MakeData.cardRequestDetails(record);
        return sendResponse(); // return ret.sendSuccess(resData, Msg.cardRequest.cardPaymentPaymentSuccess);

    } catch (e) {
        de('try-catch');
        de(e);
        return sendResponse(); // return ret.sendFail(Msg.cardRequest.cardPaymentPaymentNotUpdated);
    }
};


// Update card details
exports.cardBinding = async (req, res) => {

    const ret = res.ret;
    const _user = req._user;

    let errorThrowKey = 'default';
    const errorMessages = {
        'default': Msg.cardRequest.cardBindingFail,
        'record-not-saved': Msg.cardRequest.cardBindingFail,
        'api-response-error': Msg.cardRequest.cardBindingFail,
        'api-order-data-error': Msg.cardRequest.cardBindingFail,
    };

    try {

        req = formatReqFiles(req);
        const reqData = req.body;
        const hyperPayConfig = Constant.hyperPay;
        // TEMP COMMENT THIS FIELD: docNo, docType, frontDoc, mixDoc, signImg, docExpireDate, docNeverExpire, cardTypeId

        // Check validation {
        const isInvalid = checkValidation(reqData, {
            cardNo: 'required',
            envelopeNo: 'required',
        });
        if (isInvalid) return ret.sendFail(isInvalid);
        // } Check validation

        // Find Card Request {
        const cardRequestRecord = await CardRequest.findOne({ userId: _user._id }).exec();
        if (empty(cardRequestRecord)) return ret.sendFail(Msg.cardRequest.notFound);

        if (!(await CardRequest.countDocuments({ userId: _user._id, 'cardPayment.isPaid': true }).exec())) return ret.sendFail(Msg.cardRequest.notPaid);
        // } Find Card Request


        // Update Details {
        const cardRequestDetails = await CardRequest.findOneAndUpdate(
            { _id: cardRequestRecord._id, },
            { $set: { cardNo: getStr(reqData.cardNo), envelopeNo: getStr(reqData.envelopeNo), } },
            { new: true },
        ).exec();
        if (empty(cardRequestDetails)) return ret.throw(errorThrowKey);
        // } Update Details

        // Binding Card Details {
        const cardBindingRes = await bindCard(cardRequestDetails);


        if (empty(cardBindingRes?.code) || cardBindingRes?.code !== '00000') {
            errorThrowKey = 'api-response-error-card-binding';
            errorMessages[errorThrowKey] = (cardBindingRes?.msg || '') + ' - ' + cardBindingRes?.code || '';
            return ret.throw(errorThrowKey);
        }

        const resData = await DataManipulate.cardRequestDetails(_user._id);
        ddm(resData);
        ret.sendSuccess(resData);
        // } Binding Card Details

        // Quick Apply {
        /*const version = hyperPayConfig.apiVersion;
        const timestamp = Math.floor(Date.now() / 1000);
        const mcTradeNo = cardRequestDetails._id + '';

        const cardDetailsPayload = {
            base_info: {
                card_type_id: getStr(cardRequestDetails.cardTypeId),
                email: getStr(cardRequestDetails.email),
                first_name: getStr(cardRequestDetails.firstName),
                // first_recharge_amount: '188',
                last_name: getStr(cardRequestDetails.lastName),
                mobile: getStr(cardRequestDetails.mobile),
                mobile_code: getStr(cardRequestDetails.mobileCode),
                pre_apply: true,
                // user_ip: '40.77.166.66'
            },
            mc_trade_no: mcTradeNo,
        };


        const message = `api-key=${process.env.HYPERPAY_API_KEY}&base_info=${JSON.stringify(cardDetailsPayload.base_info)}&mc_trade_no=${cardDetailsPayload.mc_trade_no}&nonce=${process.env.HYPERPAY_NONCE}&timestamp=${timestamp}&version=${version}`;

        const sign = crypto.createSign('RSA-SHA256');
        sign.update(message);
        const signature = sign.sign(process.env.HYPERPAY_PRIVATE_KEY.split(String.raw`\n`).join('\n'), 'base64');

        const headers = { 'api-key': process.env.HYPERPAY_API_KEY, nonce: process.env.HYPERPAY_NONCE, timestamp, signature, version };

        // https://doc-api.hyperpay.io/en/2api/21_hypercard_api/2131_application_express_v4.html
        axios.post(`${process.env.HYPERPAY_CARD_API_URL}/v4/openapi/card/apply/quick`, cardDetailsPayload, { headers }).then(async (cardBasicDetailsRes) => {

            cardBasicDetailsRes = cardBasicDetailsRes?.data || {};
            dd(cardBasicDetailsRes, 'cardBasicDetailsRes');

            cardBasicDetailsRes = { code: '00000', msg: 'ok' }; // TODO: temp after remove
            dd(cardBasicDetailsRes);

            if (empty(cardBasicDetailsRes?.code) || cardBasicDetailsRes?.code !== '00000') {
                errorThrowKey = 'api-response-error';
                errorMessages[errorThrowKey] = (cardBasicDetailsRes?.msg || '') + ' - ' + cardBasicDetailsRes?.code || '';
                return ret.throw(errorThrowKey);
            }

            // https://doc-api.hyperpay.io/en/2api/21_hypercard_api/2127_binding.html

            // Binding Card Details {
            const cardBindingRes = await bindCard(cardRequestDetails);


            if (empty(cardBindingRes?.code) || cardBindingRes?.code !== '00000') {
                errorThrowKey = 'api-response-error-card-binding';
                errorMessages[errorThrowKey] = (cardBindingRes?.msg || '') + ' - ' + cardBindingRes?.code || '';
                return ret.throw(errorThrowKey);
            }

            const resData = await DataManipulate.cardRequestDetails(_user._id);
            ddm(resData);
            ret.sendSuccess(resData);
            // } Binding Card Details

        }).catch((e) => {
            de(`ERR IN: card order request api - id: card request id: ${cardRequestRecord._id}`);
            de(errorThrowKey);
            de(e);
            // CardRequest.update({ _id: cardRequestRecord._id }, { $pull: { 'cardPayment': { _id: cardPaymentId } } }).exec();
            ret.sendFail(errorMessages[errorThrowKey]);
        });*/
        // } Quick Apply

    } catch (e) {
        de('try-catch');
        de(e);
        ret.sendFail(Msg.cardRequest.cardBindingFail);
    }
};

// exports.kycBinding =
