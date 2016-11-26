/**
 *Created by py on 15/11/2016
 */
'use strict';
const TG_BOT_TOKEN = "283721029:AAFcG5IWeemNqsW_-E3peO3O-elOSaKQ94E";
// DEFINE KAFKA HOST TO CONNECT
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
const kafkaBusFactory = require('./kafka/kafkaBusFactory.es6');
const kafkaServiceFactory = require('./kafka/kafkaServiceFactory.es6');
const configFactory = require('./configFactory.es6');
const authServiceFactory = require('./auth/authServiceFactory.es6');
const apiControllerFactory = require('./api/apiControllerFactory.es6');
const authControllerFactory = require('./auth/authControllerFactory.es6');
const authAppFactory = require('./auth/authAppFactory.es6');
const apiAppFactory = require('./api/apiAppFactory.es6');
const WorkerFactory = require('./api/WorkerFactory.es6');


// CREATE APP COMPONENT INSTANCES USING FACTORY MODULES
const kafkaBus = kafkaBusFactory(kafkaHost, 'Client-Api-Service');
let kafkaService, apiController, authController, apiApp, authApp, configService, workerFactory;

kafkaService = kafkaServiceFactory(kafkaBus);
kafkaBus.producer.on('ready', () => {
    configService = configFactory(kafkaService);
    workerFactory = new WorkerFactory(kafkaService);
    configService.on('ready', () => {
        let config = configService.get();
        apiController = apiControllerFactory(kafkaService, workerFactory, config); //done
        authController = authControllerFactory(kafkaService, config); // done
        apiApp = apiAppFactory(apiController);
        authApp = authAppFactory(authController, config); // done
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
        app.post('/bot-' + config.bot.token + '/message', (request, response) => {
            console.log(request.body);
        });

// START SERVER
        app.listen(config.express.port);
    });
});
