/*  PLAY STORE USER
    USR:    kpatel
    OTP:    123456
    PSW:    123456
*/
require('dotenv').config();
// const v8 = require('node:v8');
const moment = require('moment');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cluster = require('cluster');
const http = require('http');
const cors = require('cors');
const app = express();
// const helmet = require('helmet');

//----------------------------------------------
const { d, dd, ddm, ddl, empty, getDateFormat, getHeapStat, formatBytes } = require('./helpers/helpers');
const { trimAll } = require('./helpers/trimmer');
const dbConnection = require('./connection/db');
const Construct = require('./config/Construct');
// const chalk = require('./helpers/chalk');
const Constant = require('./config/Constant');
const ServiceResponse = require('./infrastructure/ServiceResponse');
// const corsOrigin = require('./middleware/corsOrigin');
const ValidateEnv = require('./config/ValidateEnv');
// const Log = require('./infrastructure/Log');
const seeder = require('./models/seeders/seeder');


//----------------------------------------------

const serverType = process.env.SERVER_TYPE || 'all';
const serverTypeConfig = {
    isRoutes: ['all', 'app'].includes(serverType),
    isCron: ['all', 'cron'].includes(serverType),
};

//----------------------------------------------

(async () => {

    //----------------------------------------------
    // App Restart Log {
    // chalk.printLog('');
    // chalk.printLog('');
    // chalk.printBlink('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||', 'FgBlue');
    // chalk.printBlink('|| APP RESTART |||||||||||||||||||||||||||||||||||||||||||||||', 'FgBlue');
    console.log('|| APP RESTART |||||||||||||||||||||||||||||||||||||||||||||||');
    // chalk.printBlink('|| TOTAL CONNECTIONS - 3 |||||||||||||||||||||||||||||||||||||', 'FgBlue');
    // chalk.printBlink('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||', 'FgBlue');
    // chalk.printLog('');
    console.log(`SEVER-TIME-IS: ${getDateFormat(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSS')}`);
    // chalk.printLog(`SEVER-TIME-IS: ${getDateFormat(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSS')}`, 'FgBlue');
    // new Log({}, `APP-RESTART:${serverType}`);
    // } App Restart Log
    //----------------------------------------------


    //----------------------------------------------
    // Connect database {

    await ValidateEnv();
    if (!await dbConnection()) process.exit(0);
    // } Connect database
    //----------------------------------------------


    //----------------------------------------------
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    //----------------------------------------------


    //----------------------------------------------
    // App Setup {

    /* app.use(helmet());
     app.use(
         helmet.contentSecurityPolicy({
             useDefaults: true,
             directives: {
                 'script-src': ['\'self\'', '\'unsafe-inline\''],
                 'img-src': [`'self'`, `https: data:`, `*.amazonaws.com`]
             }
         }),
         helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' })
     );*/
    // app.use(cors(corsOrigin.corsOptionsDelegate));
    // app.use(cors());


    app.use(cookieParser(process.env.APP_SECRET_KEY));
    app.use(session({ secret: process.env.APP_SECRET_KEY, resave: false, saveUninitialized: false }));
    app.use(flash());
    app.use(express.static(__dirname + '/public'));
    app.use('/storage', express.static(__dirname + '/storage'));


    app.set('view engine', 'ejs');
    app.set('layout', 'admin/includes/layout');
    app.use(expressLayouts);


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(passport.initialize());
    app.use(passport.session());
    // } App Setup
    //----------------------------------------------


    //----------------------------------------------
    // App Setup Custom {
    app.use(trimAll);

    // } App Setup Custom
    //----------------------------------------------

    //----------------------------------------------
    // New Request Log {
    /*app.all('/.env', (req, res, next) => {
        return res.status(400).send('NOTFOUND - 400 The request URL was not found on this server.');
    });*/

    app.all('*', (req, res, next) => {
        // dd(req.header('Origin'), 'ori')
        // ddm(req.session);
        req.requestTag = moment().format('h:mm:ss A');
        res.ret = new ServiceResponse(req, res);
        Constant.errorPayload = { ...Constant.errorPayload, methodName: req.originalUrl, body: req.body, params: req.params };

        // Heap Out {
        const heapStat = getHeapStat();
        let heapMsg = `(Heap: low - ${heapStat.usage.toFixed(2)}% | ${formatBytes(heapStat.used_heap_size)} / ${formatBytes(heapStat.heap_size_limit)})`;

        if (heapStat.usage > 90) {
            heapMsg = `(Heap: mid - ${heapStat.usage.toFixed(2)}%) | ${formatBytes(heapStat.used_heap_size)} / ${formatBytes(heapStat.heap_size_limit)})`;
        } else if (heapStat.usage > 95) {
            heapMsg = `(Heap: hig - ${heapStat.usage.toFixed(2)}%) | ${formatBytes(heapStat.used_heap_size)} / ${formatBytes(heapStat.heap_size_limit)})`;
        }
        // } Heap Out


        // if(process.env.MAINTENANCE_ON.toString() === 'false')
        //     console.log(`| ${!empty(cluster?.worker?.id) ? `${cluster?.worker?.id} |` : ``} ${getDateFormat(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSS')} | ${heapMsg} | NEW REQUEST: ` + req.originalUrl);

        next();
    });
    // } New Request Log
    //----------------------------------------------

    //----------------------------------------------


    //----------------------------------------------
    app.get('/healthcheck', (req, res) => {
        res.json({ 'status': true, 'message': 'healthcheck' });
    });
    //----------------------------------------------


    //----------------------------------------------
    // Routes {

    if (serverTypeConfig.isRoutes) {

        const adminRouter = require('./routes/admin');
        app.use('/fw2ezuyzb751', adminRouter);

        // const apiRouterDev = require('./routes/apiDev');
        // app.use('/api/dev', apiRouterDev);

        const apiRouter = require('./routes/api');
        app.use('/api', apiRouter);

    }

    /*if(serverTypeConfig.isCron){
        const developerRouter = require('./routes/developer');
        app.use('/dev', developerRouter);
    }*/


    // } Routes
    //----------------------------------------------


    //----------------------------------------------
    // 404 Error {
    app.all('*', (req, res) => {
        //new Log(req, 404)
        return res.status(404).send('404 - The request URL was not found on this server.');
    });
    // } 404 Error
    //----------------------------------------------

    //----------------------------------------------
    // Server Run {

    // seed Database {
    seeder.adminSeeder({ isTruncate: false });
    // } seed Database


    if (process.env.APP_MODE === 'cluster') {
        const numCPUs = require('os').cpus().length;
        if (cluster.isMaster && numCPUs > 1) {
            // Count the machine's CPUs
            console.log(`Master ${process.pid} is running`);
            let cpuInUse = numCPUs - 1;
            console.log(`total CPU in usage ${cpuInUse}/${numCPUs}`)
            // Create a worker for each CPU
            for (var i = 0; i < cpuInUse; i += 1) {
                cluster.fork();
            }
            cluster.on('online', worker => {
                console.log(`Worker ${worker.process.pid} is online.`);
            });
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died`);
                cluster.fork(); // Create a new worker to replace the dead one
            });
            //----------------------------------------------
            Construct();
            // Crone job {
            if (serverTypeConfig.isCron) new CronJob('daily').run();
            new CronJob('every15').run();
            if (serverTypeConfig.isRoutes) new CronJob('every10').run();
            new CronJob('every60').run();
            new CronJob('everyMonth').run();
            //----------------------------------------------
        } else {
            const server = http.Server(app);
            const serverPort = process.env.PORT || 3001;

            server.timeout = 120000; // Set timeout to 2 minutes (120000 milliseconds)
            server.listen(serverPort, (err => console.log(err ? err : 'SERVER - server listen on ' + serverPort)));
        }
    } else {
        Construct();
        // Crone job {

        /* if (serverTypeConfig.isCron) new CronJob('daily').run();
        new CronJob('every15').run();
        if (serverTypeConfig.isRoutes) new CronJob('every10').run();
        new CronJob('every60').run();
        new CronJob('everyMonth').run(); */
        const server = http.Server(app);
        const serverPort = process.env.PORT || 3001;

        server.listen(serverPort, (err => console.log(err ? err : 'SERVER - server listen on ' + serverPort)));
    }
})();