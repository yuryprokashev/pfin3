/**
 *Created by py on 05/11/2016
 */
'use strict';
const Express = require('express');
const UserSchema = require('./models/userSchema.es6');
const Mongoose = require('mongoose');
const KafkaAdapter = require('./services/KafkaAdapter2.es6');
const EventEmitter = require('events').EventEmitter;
const guid = require('./guid.es6');
// const Config = require('./Config');
const KAFKA_TEST = "54.154.211.165";
const KAFKA_PROD = "54.154.226.55";

class ClientApiService extends EventEmitter {
    constructor(bus){
        super();
        var _this = this;
        this.serviceName = 'Client-Api-Service';
        this.unservedRequests = new Map();
        this.on('get-config-request', function(msg){
            let requestPayload;
            if(msg.requestPayload === undefined){
                requestPayload = {};
            }
            else {
                requestPayload = msg.requestPayload;
            }
            _this.unservedRequests.set(msg.requestId, requestPayload);
        });
        this.configure = function (msg) {
            let message = JSON.parse(msg.value);
            if(_this.unservedRequests.has(message.requestId)){
                console.log('Parsed message');
                console.log(message);
                let auth = message.responsePayload[0].passport;
                let db = message.responsePayload[0].db;
                let express = message.responsePayload[0].express;

                // CONNECT TO DB
                console.log(`connecting to ${db.dbURL}`);
                Mongoose.connect(db.dbURL);
                var User = Mongoose.model('User', UserSchema, 'users');


                // BOOTSTRAP API SERVER STATIC ROUTE TO GIVE BACK HTML PAGE
                _this.server = Express();
                var path = require ('path');
                _this.server.use('/assets', Express.static(path.join(__dirname, '../client')));
                _this.server.get('/', function(req, res){
                    var file = path.join(__dirname, '../client/templates/', 'index.html');
                    res.sendFile(file);
                });
                // ATTACH AUTH MODULES TO SERVER
                let googleAuth = require('./auth.es6');
                googleAuth(User, _this.server, {passport: auth});
                let facebookAuth = require('./facebookAuth.es6');
                facebookAuth(User, _this.server, {passport:auth});
                // ATTACH API MODULE TO SERVER
                let api = require('./api.es6');
                _this.server.use('/api/v1', api(bus));
                // START SERVER
                _this.server.listen(express.port);
                _this.emit('server-started', {serviceName: _this.serviceName});
                // CLEAR THIS REQUEST.
                _this.unservedRequests.delete(message.requestId);
            }
        };
        this.on('server-started', function(args){
            console.log(`${args.serviceName} bootstrapped`);
        })
    }
}
module.exports = ClientApiService;