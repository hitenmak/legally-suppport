const crypto = require('crypto');
const axios = require('axios');

// Models
const CardRequest = require('../../models/CardRequest');

// Helpers
const { d, dd, de, empty, checkValidation, getBool, getStr, getVal, getNum, generateQrcode, formatNumber, formatReqFiles, flipOnKey, getBase64FromUrl, isValidEmail, formatBytes, capitalizeFirstLetter, isEqual, ex, getDateFormat, ddm, makeList, newObjectId } = require('../../helpers/helpers');
const MakeData = require('../../helpers/makeData');
const Msg = require('../../messages/api');

const Media = require('../../infrastructure/Media/Media');
const Constant = require('../../config/Constant');


//---------------------------------------------------------------------------------------------

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
            // TEMP COMMENT THIS FIELD: docNo, docType, frontDoc, mixDoc, signImg, docExpireDate, docNeverExpire, cardTypeId

            // Check validation {
            const isInvalid = checkValidation(reqData, {
                // cardTypeId: `required | in: ${makeList(hyperPayConfig.cardType, 'id').join(',')}`,           // card_type_id: (string)[true]   | Card type ID // get from card dashboard fixed value (30000001)
                email: 'required | email | maxlength: 64',                                                  // email: (string)[true]   | Email；Maximum 64 characters. Not support "@163.com"
                firstName: 'required | maxlength: 50',                                                      // first_name: (string)[true]   | First name；Maximum 50 characters
                lastName: 'required | maxlength: 50',                                                       // last_name: (string)[true]   | First name；Maximum 50 characters
                mobile: 'required | minlength: 6 | maxlength: 11',                                          // mobile: (string)[true]   | Mobile no；Minimum 6 characters and Maximum 11 characters
                mobileCode: 'required | maxlength: 5',                                                      // mobile_code:	(string)[true]   | Mobile no country code；Maximum 5 characters
                address: 'required | maxlength: 256',                                                       // address: (string)[true]   | Mailing address，Card will sending to this address；Maximum 256 characters
                birthday: 'required | date: past',                                                          // birthday: (string)[true]   | Date of birth, format: yyyy-MM-dd
                city: 'required | maxlength: 100',                                                          // city: (string)[true]   | City；Maximum 100 characters
                countryId: `required | in: ${Object.keys(hyperPayConfig.countryId).join(',')}`,             // country_id: (integer)[true]   | Country ID，Refer to the appendix【3.2 Mobile Phone Area Code and Country Code】-【Unique ID】for the range of values
                // docNo: 'required | maxlength: 128',                                                         // doc_no: (string)[true]   | Document no；Maximum 128 characters
                // docType: `required | in: ${hyperPayConfig.docType.join(',')}`,                              // doc_type: (integer)[true]   | Document type；1 Passport 2 Identity no (Currently we only support Passport)
                emergencyContact: 'required | maxlength: 255',                                              // emergency_contact: (string)[true]   | Emergency contact person；Maximum 255 characters
                gender: `required | in: ${hyperPayConfig.gender.join(',')}`,                                // gender: (integer)[true]   | Gender:1 Male; 2 Female
                nationalityId: `required | in: ${Object.keys(hyperPayConfig.countryId).join(',')}`,         // nationality_id: (integer)[true]   | Nationality ID，Refer to the appendix【3.2 Mobile Phone Area Code and Country Code】-【Unique ID】for the range of values
                state: 'required | maxlength: 100',                                                         // state: (string)[true]   | State；Maximum 100 characters
                zipCode: 'required | maxlength: 20',                                                        // zip_code: (string)[true]   | Postal Code；Maximum 20 characters Same set as mobile no country code
                // docNeverExpire: `required | in: ${hyperPayConfig.docNeverExpire.join(',')}`,                // doc_never_expire: (integer)[true]   | Is the Document permanent; 1 is permanent，and then ignore the doc_expire_date filed; 0 is not permanent，and then the doc_expire_date filed must not Empty
                // docExpireDate: `${isEqual(reqData.docNeverExpire, 0) ? 'required | ' : ''}date`,         // doc_expire_date: (string)[false]  | Expiry date of Document；Maximum 16 characters; format: yyyy-MM-dd)

                // frontDoc: 'required',                                                                       // front_doc: (string)[true]  | Photo of front document；Encoded into base64 format. The size of this field should be less than 2MB. Support：jpg,jpeg,png
                // mixDoc: 'required',                                                                         // mix_doc: (string)[true]  | Photo of user with holding the ID/Passport；Encoded into base64 format. The size of this field should be less than 2MB. Support：jpg,jpeg,png
                // signImg: 'required',                                                                        // sign_img: (string)[true]  | Photo of signature；Encoded into base64 format. The size of this field should be less than 1 MB. Support：jpg,jpeg,png
            });
            if (isInvalid) return ret.sendFail(isInvalid);
            // } Check validation

            // Check Unique {
            if (await CardRequest.countDocuments({ userId: _user._id })) return ret.sendFail(Msg.cardRequest.alreadyApplied);
            if (await CardRequest.countDocuments({ email: reqData.email })) return ret.sendFail(Msg.cardRequest.emailAlreadyExist);
            if (await CardRequest.countDocuments({ mobile: reqData.mobile })) return ret.sendFail(Msg.cardRequest.phoneAlreadyExist);
            // } Check Unique

            // validate media file size {
            /*reqData.frontDoc = reqData.frontDoc[0] || {};
            reqData.mixDoc = reqData.mixDoc[0] || {};
            reqData.signImg = reqData.signImg[0] || {};

            let isFileInvalid = [];

            if (reqData.frontDoc.size > hyperPayConfig.mediaSize.frontDoc) isFileInvalid.push(`Front Doc should be less than ${formatBytes(hyperPayConfig.mediaSize.frontDoc)}`);
            if (!hyperPayConfig.allowMediaType.includes(reqData.frontDoc.filename.split('.')[1])) isFileInvalid.push(`Front Doc type in (${hyperPayConfig.allowMediaType.join(', ')}`);

            if (reqData.mixDoc.size > hyperPayConfig.mediaSize.mixDoc) isFileInvalid.push(`Mix Doc should be less than ${formatBytes(hyperPayConfig.mediaSize.mixDoc)}`);
            if (!hyperPayConfig.allowMediaType.includes(reqData.mixDoc.filename.split('.')[1])) isFileInvalid.push(`Mix Doc type in (${hyperPayConfig.allowMediaType.join(', ')}`);

            if (reqData.signImg.size > hyperPayConfig.mediaSize.signImg) isFileInvalid.push(`Sign Img should be less than ${formatBytes(hyperPayConfig.mediaSize.signImg)}`);
            if (!hyperPayConfig.allowMediaType.includes(reqData.signImg.filename.split('.')[1])) isFileInvalid.push(`Sign Img type in (${hyperPayConfig.allowMediaType.join(', ')}`);

            isFileInvalid = isFileInvalid.join(', ');
            if (!empty(isFileInvalid)) return ret.sendFail(isFileInvalid);*/
            // } validate media file size


            // Create Card Record {
            const newRecord = new CardRequest;
            newRecord.userId = _user._id;
            // newRecord.cardTypeId = getStr(reqData.cardTypeId);
            // newRecord.cardTypeName = getStr(flipOnKey(hyperPayConfig.cardType, 'id')[reqData.cardTypeId].type);
            newRecord.email = getStr(reqData.email);
            newRecord.firstName = getStr(reqData.firstName);
            newRecord.lastName = getStr(reqData.lastName);
            newRecord.mobile = getStr(reqData.mobile);
            newRecord.mobileCode = getStr(reqData.mobileCode);
            newRecord.address = getStr(reqData.address);
            newRecord.birthday = getVal(reqData.birthday);
            newRecord.city = getStr(reqData.city);
            newRecord.countryId = getNum(hyperPayConfig.countryId[reqData.countryId]);
            // newRecord.docNo = getStr(reqData.docNo);
            // newRecord.docType = getNum(reqData.docType);
            newRecord.emergencyContact = getStr(reqData.emergencyContact);
            newRecord.gender = getNum(reqData.gender);
            newRecord.nationalityId = getNum(hyperPayConfig.countryId[reqData.nationalityId]);
            newRecord.state = getStr(reqData.state);
            newRecord.zipCode = getStr(reqData.zipCode);
            // newRecord.docNeverExpire = getNum(reqData.docNeverExpire);
            // newRecord.docExpireDate = getVal(reqData.docExpireDate);

            // newRecord.frontDoc = getStr(reqData.frontDoc.filename);
            // newRecord.mixDoc = getStr(reqData.mixDoc.filename);
            // newRecord.signImg = getStr(reqData.signImg.filename);

            newRecord.save().then(async record => {
                if (empty(record)) {
                    errorThrowKey = 'record-not-saved';
                    return ret.throw(errorThrowKey);
                }

                const resData = MakeData.cardRequestDetails(record);

                ddm(resData, 'resData card');
                ret.sendSuccess(resData, Msg.cardRequest.cardRequestCreated);

                // Create Card Request { TEMP not call card request api

                // Image convert to base64 {
                /*const docBase64 = { frontDoc: null, mixDoc: null, signImg: null };
                if (!empty(record.frontDoc)) {
                    const frontDocBase64 = await getBase64FromUrl(Media.getCardAttachment(record.frontDoc));
                    docBase64.frontDoc = frontDocBase64.split(',')?.[1] || '';
                }
                if (!empty(record.mixDoc)) {
                    const mixDocBase64 = await getBase64FromUrl(Media.getCardAttachment(record.mixDoc));
                    docBase64.mixDoc = mixDocBase64.split(',')?.[1] || '';
                }
                if (!empty(record.signImg)) {
                    const signImgBase64 = await getBase64FromUrl(Media.getCardAttachment(record.signImg));
                    docBase64.signImg = signImgBase64.split(',')?.[1] || '';
                }
                if (empty(record.frontDoc) || empty(record.mixDoc) || empty(record.signImg)) {
                    errorThrowKey = 'image-not-convert-base64';
                    return ret.throw(errorThrowKey);
                }*/
                // } Image convert to base64


                /*let cardRequestPayload = {
                    base_info: {
                        card_type_id: getStr(record.cardTypeId),
                        email: getStr(record.email),
                        first_name: getStr(record.firstName),
                        first_recharge_amount: '188', //TODO: verify with real value
                        last_name: getStr(record.lastName),
                        mobile: getStr(record.mobile),
                        mobile_code: getStr(record.mobileCode),
                        pre_apply: 'true',
                    },
                    /!*kyc_info: {
                        address: getStr(record.address),
                        birthday: getDateFormat(record.birthday, 'YYYY-MM-DD'),
                        city: getStr(record.city),
                        country_id: getNum(record.countryId),
                        doc_no: getStr(record.docNo),
                        doc_type: getNum(record.docType),
                        emergency_contact: getStr(record.emergencyContact),
                        front_doc: getStr(docBase64.frontDoc),
                        gender: getNum(record.gender),
                        mix_doc: getStr(docBase64.mixDoc),
                        nationality_id: getNum(record.nationalityId),
                        sign_img: getStr(docBase64.signImg),
                        state: getStr(record.state),
                        zip_code: getStr(record.zipCode),
                        doc_expire_date: getDateFormat(record.docExpireDate, 'YYYY-MM-DD'),
                        doc_never_expire: getNum(record.docNeverExpire),
                    },*!/
                    mc_trade_no: record._id + '',
                };

                // Create Signature {
                const timestamp = Date.now();
                const version = '1.0';
                // const message = `api-key=${process.env.HYPERPAY_API_KEY}&base_info=${JSON.stringify(cardRequestPayload.base_info)}&kyc_info=${JSON.stringify(cardRequestPayload.kyc_info)}&mc_trade_no=${cardRequestPayload.mc_trade_no}&nonce=${process.env.HYPERPAY_NONCE}&timestamp=${timestamp}&version=${version}`;
                const message = `api-key=${process.env.HYPERPAY_API_KEY}&base_info=${JSON.stringify(cardRequestPayload.base_info)}&mc_trade_no=${cardRequestPayload.mc_trade_no}&nonce=${process.env.HYPERPAY_NONCE}&timestamp=${timestamp}&version=${version}`;

                const sign = crypto.createSign('RSA-SHA256');
                sign.update(message);
                const signature = sign.sign(process.env.HYPERPAY_PRIVATE_KEY.split(String.raw`\n`).join('\n'), 'base64');
                const headers = { 'api-key': process.env.HYPERPAY_API_KEY, nonce: process.env.HYPERPAY_NONCE, timestamp, signature, version, };
                // } Create Signature

                axios.post(`${process.env.HYPERPAY_CARD_REQUEST_API_URL}`, cardRequestPayload, { headers }).then(async (cardRequestRes) => {
                    ddm(cardRequestRes.data, 'cardRequestRes'); // { code: '00000', msg: 'ok' }

                    const requestData = cardRequestRes?.data || {};
                    if (requestData.code !== '00000') {
                        errorThrowKey = 'api-response-error';
                        errorMessages[errorThrowKey] = (requestData.msg || '') + ' - ' + requestData.code;
                        return ret.throw(errorThrowKey);
                    }

                    const resData = MakeData.cardRequestDetails(record);

                    ddm(resData, 'resData card');
                    ret.sendSuccess(resData, Msg.cardRequest.cardRequestCreated);
                }).catch((e) => {
                    de('ERR IN: card request api - id: ' + newRecord._id);
                    de(errorThrowKey);
                    de(e);
                    CardRequest.findByIdAndDelete(newRecord._id).exec();
                    ret.sendFail(errorMessages[errorThrowKey]);
                });*/
                // } Create Card Request


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


// Check card details and status 0
exports.details = async (req, res) => {

    const ret = res.ret;
    const _user = req._user;
    const reqData = req.body;
    try {

        const record = await CardRequest.findOne({ userId: _user._id }).lean();
        if (empty(record)) return ret.sendFail(Msg.cardRequest.notFound);
        const resData = MakeData.cardRequestDetails(record);
        ret.sendSuccess(resData, Msg.cardRequest.found);

    } catch (e) {
        de(e);
        ret.err500();
    }
};


// Create card payment 2nd
exports.createOrder = async (req, res) => {

    const ret = res.ret;
    const _user = req._user;
    const reqData = req.body;

    let errorThrowKey = 'default';
    const errorMessages = {
        'default': Msg.cardRequest.cardOrderNotCreated,
        'record-not-saved': Msg.cardRequest.cardOrderNotCreated,
        'api-response-error': Msg.cardRequest.cardOrderNotCreated,
        'api-order-data-error': Msg.cardRequest.cardOrderNotCreated,
    };
    let cardOrderId = newObjectId();
    try {

        const hyperPayConfig = Constant.hyperPay;
        const version = '1.0';
        const timestamp = Math.floor(Date.now() / 1000);
        const language = 'en';
        const merchantOrderId = cardOrderId; // merchantOrderId: is card order id (subdoc id)
        const paymentReturnUrl = hyperPayConfig.cardOrderResponse + merchantOrderId;


        // Find Card Request {
        const cardRequestRecord = await CardRequest.findOne({ userId: _user._id }).exec();
        if (empty(cardRequestRecord)) return ret.sendFail(Msg.cardRequest.notFound);
        // } Find Card Request

        const newOrderRecord = {
            _id: cardOrderId,
            amount: getNum(hyperPayConfig.cardOrderAmount),
            timestamp: getNum(timestamp),
        };
        // dd(newOrderRecord);
        if (empty(cardRequestRecord.cardOrder)) cardRequestRecord.cardOrder = [];
        cardRequestRecord.cardOrder.push(newOrderRecord);

        // dd(cardRequestRecord);
        // Create Order Record {
        cardRequestRecord.save().then(async record => {
            if (empty(record)) {
                errorThrowKey = 'record-not-saved';
                return ret.throw(errorThrowKey);
            }

            // Create Payment Link {
            currentCardTypeData = hyperPayConfig.cardType[0];
            const message = `amount=${currentCardTypeData.cardFeeAmount}&app_id=${process.env.HYPERPAY_APP_ID}&currency=${hyperPayConfig.cardOrderCurrency}&lang=${language}&merchant_order_id=${merchantOrderId}&return_url=${paymentReturnUrl}&time=${timestamp}&version=${version}`;

            const sign = crypto.createSign('md5WithRSAEncryption');
            sign.update(message);
            const signature = sign.sign(process.env.HYPERPAY_ORDER_PRIVATE_KEY.split(String.raw`\n`).join('\n'), 'base64');

            let orderCreatePayload = {
                'amount': currentCardTypeData.cardFeeAmount,
                'app_id': process.env.HYPERPAY_APP_ID,
                'currency': hyperPayConfig.cardOrderCurrency,
                'lang': language,
                'merchant_order_id': merchantOrderId,
                'return_url': paymentReturnUrl,
                'sign': signature,
                'time': timestamp,
                'version': version,

            };
            axios.post(`${process.env.HYPERPAY_ORDER_CREATE_API_URL}`, orderCreatePayload, { 'Content-Type': 'application/json; charset=utf-8' }).then(async (cardOrderRes) => {

                cardOrderRes = cardOrderRes?.data || {};
                // dd(cardOrderRes);
                if (empty(cardOrderRes?.status) || empty(cardOrderRes?.data) || cardOrderRes?.status != 200) {
                    errorThrowKey = 'api-response-error';
                    errorMessages[errorThrowKey] = (cardOrderRes?.msg || '') + ' - ' + cardOrderRes?.status || '';
                    return ret.throw(errorThrowKey);
                }

                const cardOrderData = cardOrderRes.data || {};
                if (empty(cardOrderData.merchant_order_id) || empty(cardOrderData.expires_at) || empty(cardOrderData.checkout_url)) {
                    errorThrowKey = 'api-order-data-error';
                    errorMessages[errorThrowKey] = ' Merchant Order Id, Expires At, Checkout Url not found - ' + cardOrderRes?.status || '';
                    return ret.throw(errorThrowKey);
                }

                dd(cardOrderData, 'cardOrderData');
                CardRequest.findOneAndUpdate({ _id: cardRequestRecord._id, 'cardOrder._id': cardOrderId }, { $set: { 'cardOrder.$.orderNo': cardOrderData.order_no } }).exec();

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
                    orderNo: getStr(cardOrderData.order_no),
                    merchantOrderId: getStr(cardOrderData.merchant_order_id),
                    expiresAt: getStr(cardOrderData.expires_at),
                    checkoutUrl: getStr(cardOrderData.checkout_url),
                };

                ret.sendSuccess(resData, Msg.cardRequest.cardOrderCreated);
            }).catch((e) => {
                de(`ERR IN: card order request api - id: card request id: ${newOrderRecord._id} | order id: ${cardOrderId}`);
                de(errorThrowKey);
                de(e);
                CardRequest.update({ _id: cardRequestRecord._id }, { $pull: { 'cardOrder': { _id: cardOrderId } } }).exec();
                ret.sendFail(errorMessages[errorThrowKey]);
            });
            // } Create Payment Link

        }).catch(e => {
            de(`ERR IN: card order create - card request id: ${newOrderRecord._id} | order id: ${cardOrderId}`);
            de(errorThrowKey);
            de(e);
            CardRequest.update({ _id: cardRequestRecord._id }, { $pull: { 'cardOrder': { _id: cardOrderId } } }).exec();
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


// Update card status from card api call back/ end point
exports.updateOrderStatus = async (req, res) => {

    const ret = res.ret;
    const _user = req._user;
    const reqData = req.body;
    const orderId = req.params.orderId;

    try {
        const record = await CardRequest.findOneAndUpdate(
            { 'cardOrder._id': orderId },
            { $set: { 'cardOrder.$.isPaid': true, 'paymentAt': new Date()}},
            {new: true}
        ).exec();
        if (empty(record)) return ret.sendFail(Msg.cardRequest.cardOrderPaymentFail);

        const resData = MakeData.cardRequestDetails(record);
        ret.sendSuccess(resData, Msg.cardRequest.cardOrderPaymentSuccess);

    } catch (e) {
        de('try-catch');
        de(e);
        ret.sendFail(Msg.cardRequest.cardOrderPaymentNotUpdated);
    }
};

