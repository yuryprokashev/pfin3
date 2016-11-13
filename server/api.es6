"use strict";
var bodyparser = require( 'body-parser' );
var express = require( 'express' );
var status = require( 'http-status' );

var MyDates = require('../client/js/MyDates.es6');

const util = require('util');
const Manager = require('../server/modules/Manager.es6');
var TG_BOT_TOKEN = "283721029:AAFcG5IWeemNqsW_-E3peO3O-elOSaKQ94E";

var routes = function(bus) {

    var manager = new Manager(bus);

    var api = express.Router();

    api.use(bodyparser.json());

    api.get( '/me', function ( req, res ) {
        if(!req.user) {
            return res.status( status.UNAUTHORIZED ).json( { error: 'not logged in' });
        }
        //console.log(req.user);
        res.json( { user: req.user } );
    });

    api.get('/payload/monthData/:targetPeriod', function(req, res){
        var isNoUser = handleNoUser(req, res);
        if(isNoUser === false){
            manager.manage(req, res)
                .then(
                    manager.returnResult,
                    manager.returnError
                )
        }
    });
    
    // @param: HttpRequest req
    // @param: HttpResponse res
    // @function: replies to Client, that no user is prodived with request, if no user is provided.
    // in case of user is not provided, it replies nothing.
    // @return: Bool true, if NoUser, else returns false.
    var handleNoUser = function (req, res) {
        var reply;
        // console.log(req.user);
        // console.log(req.body.user);
        if(req.method === "POST" && req.body.user === undefined) {
            reply = {error: "Please, log in."};
            res.json(reply);
            return true;
        }
        else if(req.method === "GET" && req.user === undefined) {
            reply = {error: "Please, log in."};
            res.json(reply);
            return true;
        }
        else {
            return false;
        }
    };

    api.get('/command/:commandType/:dayCode/:payloadType/:commandId', function(req,res){

        var isNoUser = handleNoUser(req,res);

        if(isNoUser === false) {
            manager.manage(req, res)
                .then(
                    manager.returnResultA,
                    manager.returnError
                );
        }
    });
    
    api.get('/command/:commandType/:targetPeriod/:sourcePeriod/:payloadType/:commandId', function (req, res){
        var isNoUser = handleNoUser(req,res);

        if(isNoUser === false){
            manager.manage(req, res)
                .then(
                    manager.returnCommandResult,
                    manager.returnError
                )
        }
    });

    // @param: String dayCode - daycode in YYYYMMDD format
    // @function: POST new Message from User to from MessageService via async query.
    // @return: HttpResponse with Message save status: {status: true} or {status: false, error: Error}

    api.post('/message/:t', function(req, res){

        var isNoUser = handleNoUser(req,res);

        if(isNoUser === false) {
            manager.manage(req, res)
                .then(
                    manager.returnResult,
                    manager.returnError
                );
        }
    });

    // @param: String dayCode - daycode in YYYYMMDD format
    // @param: String payloadType - type of payload, client wants (1 for Expenses)
    // @param: String sortParan - name of the field, by which to sort the result array.
    // @param: String sortOrder - sort order for 'sortParam'. Either 1, or -1.
    // @function: GET data from PayloadService via async query. Return payload data synchronously.
    // @return: HttpResponse with JSON array of payload objects for authorized user.
    api.get('/payload/:dayCode/:payloadType/:sortParam/:sortOrder', function (req, res) {

        var isNoUser = handleNoUser(req,res);
        if(isNoUser === false) {
            manager.manage(req, res)
                .then(
                    manager.returnResult,
                    manager.returnError
                );
        }
    });

    api.post('/bot-' + TG_BOT_TOKEN + '/message', function (req, res) {
        console.log(req.body);
        res.json({success: true});
    });

    console.log('api attached');
    return api;
};

module.exports = routes;