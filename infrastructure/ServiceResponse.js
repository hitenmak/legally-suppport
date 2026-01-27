const { dd, de } = require('../helpers/helpers');
const ejsHelper = require('../helpers/ejsHelpers');
// const chalk = require('../helpers/chalk');
// const moment = require('moment');

class ServiceResponse
{
    constructor(req, res) {
        this.res = res;
        this.req = req;
        this.isSuccess = false;
        this.message = 'Invalid data';
        this.data = null;
        this.accessToken = '';
        this.refreshToken = '';
        this.viewPrefix = null;
        this.routePrefix = null;
        this.routePath = req.originalUrl;
        this.requestTag = req.requestTag;
        // this.requestTime = {in: Date.now(), exit: 0, total: 0}
        // this.flashMessages = req.flash('message');
        // this.req.flash('message', 'You are now logged in.');
    }

    logResponseSend (url = null) {
       /* chalk.printDim('|-------------------------------------------------------------', 'FgYellow');
        chalk.printDim(`| ${this.requestTag}`, 'FgYellow');
        chalk.printDim('| END REQUEST: ' + (url ?? this. routePath), 'FgYellow');
        // chalk.printDim('| FROM: ' + req.header('Origin'), 'FgYellow');
        // chalk.printDim('|', 'FgYellow');
        chalk.printDim('|-------------------------------------------------------------', 'FgYellow');
        chalk.printDim('');*/

    }

    printProcessTime () {
        // this.requestTime.exit = Date.now();
        // dd('');
        // chalk.printBlink((this.requestTime.exit - this.requestTime.in)+' ms', 'BgBlack');
    }

    // Generate Error Log
    /*generateErrorLog = (error = null) => {
        return new Promise(async (resolve, reject) => {
            dd(error, 'error')
            let record = new ErrorLog();
            let errorPayload = AppConstant.errorPayload
            record.error = JSON.stringify(error || errorPayload.error);
            record.methodName = errorPayload.methodName;
            record.body = JSON.stringify(errorPayload.body);
            record.params = JSON.stringify(errorPayload.params);
            dd(record)
            record.save().then(updatedRecord => {}).catch(e => dd(e ));

        });
    };*/

    // Return Json ------------------------------------------------------------------------------
    send(isSuccess = this.isSuccess, data = this.data, message = this.message, statusCode = 200) {

        this.res.status(statusCode).json({
            isSuccess: isSuccess,
            message: message,
            data: data,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
        });
        this.logResponseSend();
    }

    /*err400(isSuccess = false, message = 'Invalid request', data = {}) {
        this.res.status(400).json({
            isSuccess: isSuccess,
            message: message,
            data: data
        });
    }*/

    err500(err = 500) {
        const error = new Error(err);
        de(error, 'Error is thrown by code :(');
        // this.generateErrorLog(err);
        error.httpStatusCode = 500;
        this.res.status(500).json({
            isSuccess: false,
            message: 'Server error',
            data: error,
            error: err,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
        });
    }

    err503(message = `We're busy updating the \nFortune Machine App for you.\nPlease check back soon.`) {
        this.res.status(503).json({
            message,
        });
    }

    sendSuccess(data, message = 'Success') {
        this.printProcessTime();
        this.send(true, data, message);

    }

    throw(message = 'Throw: data not updated') {
        throw new Error(message);
    }

    sendFail(message = 'Something went to wrong', data = {}) {
        this.send(false, data, message);
    }

    sendFailError(data, error, message = '', code = 200 ){
        this.printProcessTime();
        this.res.status(code).json({
            isSuccess: false,
            message,
            data,
            error,
            refreshToken: this.refreshToken,
        });
    }

    /*noData(message = 'Invalid operation', data = {}, isSuccess = false) {
        this.res.status(200).json({
            isSuccess: isSuccess,
            message: message,
            data: data
        });
    }*/

    // Return & Redirect View ------------------------------------------------------------------------------
    back(err) {
        res.redirect('back');
    }

    // Go Back With Error
    goBackError(message = 'Invalid operation') {
        this.req.flash('flashMessages', message ? { error: message } : null);
        this.res.redirect('back');
    }

    // Go Back With Success
    goBackSuccess(message = 'Success') {
        this.req.flash('flashMessages', message ? { success: message } : null);
        this.res.redirect('back');
    }

    // Redirect Url With Error
    redirectError(route, message = 'Invalid operation') {
        dd(message ? { error: message } : null);
        this.req.flash('flashMessages', message ? { error: message } : null);
        this.res.redirect(this.routePrefix + '/' + route);
    }

    // Redirect Url With Success
    redirectSuccess(route, message = 'Success') {
        this.req.flash('flashMessages', message ? { success: message } : null);
        this.res.redirect(this.routePrefix + '/' + route);
    }


    // Redirect Url Flash
    redirect(route, flashMessages = null) {
        this.req.flash('flashMessages', flashMessages);
        this.res.redirect(this.routePrefix + '/' + route);
    }

    // Return Html
    render(viewName, payload = {}, isFullPath = null, isPageLayout = false) {
        payload.ServiceConfig = {
            isPageLayout: isPageLayout,
            activeRoute: this.req.path,
            activeRouteSlug: this.req.originalUrl,
            adminPermissions: this.req.userPermission || {},
            isMasterAdmin: this.req.isMasterAdmin || false,
            routePrefix: this.routePrefix,
        };
        payload.FlashMessages = this.req.flash('flashMessages');
        payload.AuthUser = this.req.user || {};
        payload._ = ejsHelper;
        payload.viewData = { ...(payload.viewData || {}), baseUrl: process.env.APP_URL + '/fw2ezuyzb751/' };

        this.res.render(this.viewPrefix+viewName, payload);
    }

}

module.exports = ServiceResponse;