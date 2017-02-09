/**
 *Created by py on 15/11/2016
 */
'use strict';
// DEFINE KAFKA HOST TO CONNECT

const SERVICE_NAME = 'clientapi';

const KAFKA_TEST = "54.154.211.165";
const KAFKA_PROD = "54.154.226.55";

const parseProcessArgs = require('./helpers/parseProcessArgs.es6');
let args = parseProcessArgs();
let kafkaHost = (function(bool){
    let result = bool ? KAFKA_PROD : KAFKA_TEST;
    console.log(result);
    return result;
})(args[0].isProd);

const EventEmitter = require('events').EventEmitter;

// WIRE EXTERNAL LIBRARIES
const express = require('express');
const bodyParser = require('body-parser');
const path = require ('path');
// CREATE APP
const app = module.exports = express();

// WIRE FACTORY MODULES
const kafkaBusFactory = require('my-kafka').kafkaBusFactory;
const kafkaServiceFactory = require('my-kafka').kafkaServiceFactory;

const loggerAgentFactory = require('my-logger').loggerAgentFactory;

const configObjectFactory = require('my-config').configObjectFactory;
const configServiceFactory = require('my-config').configServiceFactory;
const configCtrlFactory = require('my-config').configCtrlFactory;

const authServiceFactory = require('./auth/authServiceFactory.es6');
const apiCtrlFactory = require('./api/apiControllerFactory.es6');
const authCtrlFactory = require('./auth/authControllerFactory2.es6');
const authAppFactory = require('./auth/authAppFactory.es6');

const apiAppFactory = require('./api/apiAppFactory.es6');
// const WorkerFactory = require('./workers/WorkerFactory.es6');
const workerStorageFactory = require('./workers/workerStorageFactory.es6');
const workerServiceFactory = require('./workers/workerServiceFactory.es6');

const botAppFactory = require('./bot/botAppFactory.es6');
const botCtrlFactory = require('./bot/botCtrlFactory.es6');

const httpClientFactory = require('./http/httpClientFactory.es6');
const httpServiceFactory = require('./http/httpServiceFactory.es6');
const httpCtrlFactory = require('./http/httpCtrlFactory.es6');


// CREATE APP COMPONENT INSTANCES USING FACTORY MODULES
let kafkaBus,
    httpClient,
    configObject,
    workerStorage;

let apiApp,
    authApp,
    botApp;

let configService,
    kafkaService,
    httpService,
    workerService;

let apiCtrl,
    authCtrl,
    botCtrl,
    httpCtrl,
    configCtrl,
    loggerAgent;

let httpConfig,
    apiConfig,
    authConfig,
    expressConfig;

let bootstrapComponents,
    handleError;

bootstrapComponents = () => {
    configObject = configObjectFactory(SERVICE_NAME, EventEmitter);
    configService = configServiceFactory(configObject, EventEmitter);
    configCtrl = configCtrlFactory(configService, kafkaService, EventEmitter);

    loggerAgent.listenLoggerEventsIn([configCtrl, configService, configObject]);

    configCtrl.on('ready', () => {

        workerStorage = workerStorageFactory();
        workerService = workerServiceFactory(workerStorage);

        httpConfig = configService.read('bot');
        httpClient = httpClientFactory(httpConfig);
        httpService = httpServiceFactory(httpClient);
        httpCtrl = httpCtrlFactory(httpService, configService);

        apiConfig = configService.read('pusher');
        // apiCtrl = apiCtrlFactory(workerFactory, apiConfig);
        apiCtrl = apiCtrlFactory(workerService, kafkaService, apiConfig);
        apiApp = apiAppFactory(apiCtrl);

        authConfig = configService.read('clientapi.auth.passport');
        // authCtrl = authCtrlFactory(workerFactory, authConfig);
        authCtrl = authCtrlFactory(workerService, kafkaService, authConfig);
        authApp = authAppFactory(authCtrl, authConfig);

        botCtrl = botCtrlFactory(workerFactory, httpCtrl, undefined);
        botApp = botAppFactory(botCtrl);

        // WIRE APP STATIC ROUTES
        app.use('/assets', express.static(path.join(__dirname, '../client')));
        app.get('/', function (req, res) {
            let file = path.join(__dirname, '../client/templates/', 'index.html');
            res.sendFile(file);
        });

        // WIRE DIFFERENT APP CONTROLLERS TO THEIR ROUTES
        app.use(bodyParser.json());
        app.use('/browser', authApp);
        app.use('/browser/api/v1', apiApp);
        app.use(`/bot-${httpConfig.token}`, botApp);

        // START SERVER
        expressConfig = configService.read('clientapi.express');
        app.listen(expressConfig.port);
        console.log('api started');
    });
    configCtrl.on('error', (args) => {
        handleError(args);
    });
};

handleError = (err) => {
    //TODO. Implement centralized error logging.
    console.log(err);
};

kafkaBus = kafkaBusFactory(kafkaHost, SERVICE_NAME, EventEmitter);
kafkaService = kafkaServiceFactory(kafkaBus, EventEmitter);

loggerAgent = loggerAgentFactory(kafkaService, EventEmitter);
loggerAgent.listenLoggerEventsIn([kafkaBus, kafkaService]);



kafkaBus.producer.on('ready', bootstrapComponents);