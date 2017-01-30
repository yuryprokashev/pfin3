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

// WIRE EXTERNAL LIBRARIES
const express = require('express');
const bodyParser = require('body-parser');
const path = require ('path');
// CREATE APP
const app = module.exports = express();

// WIRE FACTORY MODULES
const kafkaBusFactory = require('my-kafka').kafkaBusFactory;
const kafkaServiceFactory = require('my-kafka').kafkaServiceFactory;

const configObjectFactory = require('my-config').configObjectFactory;
const configServiceFactory = require('my-config').configServiceFactory;
const configCtrlFactory = require('my-config').configCtrlFactory;

const authServiceFactory = require('./auth/authServiceFactory.es6');
const apiCtrlFactory = require('./api/apiControllerFactory.es6');
const authCtrlFactory = require('./auth/authControllerFactory2.es6');
const authAppFactory = require('./auth/authAppFactory.es6');

const apiAppFactory = require('./api/apiAppFactory.es6');
const WorkerFactory = require('./workers/WorkerFactory.es6');

const botAppFactory = require('./bot/botAppFactory.es6');
const botCtrlFactory = require('./bot/botCtrlFactory.es6');

const httpClientFactory = require('./http/httpClientFactory.es6');
const httpServiceFactory = require('./http/httpServiceFactory.es6');
const httpCtrlFactory = require('./http/httpCtrlFactory.es6');


// CREATE APP COMPONENT INSTANCES USING FACTORY MODULES
let kafkaBus,
    httpClient,
    configObject;

let apiApp,
    authApp,
    botApp;

let configService,
    kafkaService,
    httpService,
    workerFactory;

let apiCtrl,
    authCtrl,
    botCtrl,
    httpCtrl,
    configCtrl;


kafkaBus = kafkaBusFactory(kafkaHost, SERVICE_NAME);
kafkaService = kafkaServiceFactory(kafkaBus);
workerFactory = new WorkerFactory(kafkaService);

kafkaBus.producer.on('ready', ()=> {

    configObject = configObjectFactory(SERVICE_NAME);
    configObject.init().then(
        (config) => {
            configService = configServiceFactory(config);
            configCtrl = configCtrlFactory(configService, kafkaService);
            kafkaService.subscribe('get-config-response', true, configCtrl.writeConfig);
            kafkaService.send('get-config-request', true, configObject);
            configCtrl.on('ready', () => {

                httpClient = httpClientFactory(configObject.bot);
                httpService = httpServiceFactory(httpClient);
                httpCtrl = httpCtrlFactory(httpService, configObject.bot);

                apiCtrl = apiCtrlFactory(workerFactory, configObject);
                apiApp = apiAppFactory(apiCtrl);

                authCtrl = authCtrlFactory(workerFactory, configObject);// TODO. Change configObject to configObject.passport
                authApp = authAppFactory(authCtrl, configObject);

                botCtrl = botCtrlFactory(workerFactory, httpCtrl, configObject); //TODO. configObject is not used in botCtrlFactory
                botApp = botAppFactory(botCtrl);
                // WIRE APP STATIC ROUTES
                app.use('/assets', express.static(path.join(__dirname, '../client')));
                app.get('/', function(req, res){
                    let file = path.join(__dirname, '../client/templates/', 'index.html');
                    res.sendFile(file);
                });

// WIRE DIFFERENT APP CONTROLLERS TO THEIR ROUTES
                app.use(bodyParser.json());
                app.use('/browser', authApp);
                app.use('/browser/api/v1', apiApp);
                app.use(`/bot-${configObject.bot.token}`, botApp);

// START SERVER
                app.listen(configObject.express.port);

            });
            configCtrl.on('error', (args) => {
                console.log(args);
            });
        },
        (err) => {
            console.log(`ConfigObject Promise rejected ${JSON.stringify(err.error)}`);
        }
    );
});