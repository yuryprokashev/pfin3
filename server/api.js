//var m = require( './models/model.js');
var bodyparser = require( 'body-parser' );
var express = require( 'express' );
var status = require( 'http-status' );

var MonthData = require('../common/MonthData');
var MyDates = require('../common/MyDates');

const util = require('util');
const Manager = require('../server/modules/Manager');
var manager = new Manager();

var routes = function( wagner ) {

    var api = express.Router();

    api.use(bodyparser.json());


    // api to get default data for charts.
    api.get( '/charts/meta', wagner.invoke( function( Config ) {
        return function( req, res ){
            res.json( Config.plotly );
        }
    }));


    // API commands for internal use
    // api method for arbitrary quantity of guids generation and saving it to file.
    api.get( '/generate/guid/:qty', function( req, res) {
        var qty = req.params.qty;
        var fs = require('fs');
        var result = [];

        for( var i = 0; i < qty; i++ ) {
            result.push(require('../common/guid')());
        };

        var filename = 'guids' + Date.now();

        fs.writeFile( filename, result.toString() , function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        res.send(filename);
    });

    // api method for translating the strings to dates objects in expenses collection
    api.get( '/transformdate', wagner.invoke( function( Expense ) {
        return function( req, res ) {

            // console.log(qty);

            Expense.find().exec( function( err, data ){
                //var dates = [];
                for(var i = 0; i < data.length; i++) {
                    // console.log(data[i].date);
                    var newDateValue = Date.parse(data[i].date);
                    console.log(newDateValue);
                    // console.log(typeof newDate);
                    Expense.update({_id: data[i]._id}, {
                        date: new Date(newDateValue),
                        createdAt: new Date(newDateValue),
                        labels: {
                            isConfirmed: true,
                            isDeleted:false,
                            isDefault: false
                        }
                    }, function( err, raw ){
                        if(err){ console.log(err);}
                        else {
                            console.log('raw response = ', raw);
                        }
                    })
                }
                res.send(data);
            });
        }
    }));


    // API to provide guid generation to external systems.
    api.get( '/guid', function (req,res) {
        res.format = "application/json";
        res.json({ guid: require('../common/guid')() });
    });

    // api that gets all expenses for given user and specified monthId.
    api.get( '/total/:monthId', wagner.invoke( function( Expense ) {
        return function( req, res ){
            var user = req.user;
            if (!user) { res.json({ error: "Please, log in" }); }

            else {
                var mId = req.params.monthId;

                if ( ( mId.length === 6 ) || ( mId.length === 5 ) ) {
                    var month = mId.length === 6 ? mId.substring(4,6) : mId.substring(4,5);

                    var agg = [{$match: {user: user._id.toString(), "labels.isDeleted": false}},
                        {$project: {_id:1, amount:1, labels:1, month: {$month: "$date"}}},
                        {$match: {month: Number(month) + 1}},
                        {$group: {_id:"$month", monthTotalFact: {$sum: {$cond: [{$eq:["$labels.isConfirmed", true]}, "$amount", 0]}}, monthTotalPlan: {$sum: {$cond: [{$eq:["$labels.isConfirmed", false]}, "$amount", 0]}}}}]

                    Expense.aggregate(agg).exec( function(err, result){
                        if(err) { console.log(err) }
                        res.json(result);
                    });
                }
                else { console.error('wrong monthId length is passed to api'); }
            }
        }
    }));

    // NEW VERSION OF API!!!

    api.get( '/me', function ( req, res ) {
        if(!req.user) {
            return res.status( status.UNAUTHORIZED ).json( { error: 'not logged in' });
        }
        //console.log(req.user);
        res.json( { user: req.user } );
    });

    // param: String t - timewindow in string representation. In this case strictly 6 chars required.
    api.get( '/month/:t', wagner.invoke(function(Expense) {
        return function( req, res ) {
            var user = req.user;
            if(!user) {
                res.json({ error: "Please, log in" });
            }
            else {
                var t = req.params.t;
                if(t.length !== 6){
                    res.json({error: "wrong month length. 8 chars expected."});
                }
                else {
                    var m = MyDates.getMonthFromString(t);
                    var y = MyDates.getYearFromString(t);
                    var agg = [
                        {$match: {user: user._id.toString(), "labels.isDeleted": false}},
                        {$project: {_id:1, amount:1, description:1, date:1, labels:1, year: {$year:"$date"}, month: {$month:"$date"},day: {$dayOfMonth: "$date"}, isPlanned: {$cond:{if:{$eq:["$labels.isConfirmed",false]}, then:"plan", else:"fact"}}}},
                        {$match: {year: y, month: m}},
                        {$project: { _id:1, amount:1,isPlanned: "$isPlanned"}},
                        {$group: {_id: "$isPlanned", total: {$sum: "$amount"}}}
                    ];
                    Expense.aggregate(agg).exec( function(err, result){
                        if(err) { console.log(err) }

                        var monthData;
                        function findPlan(item) {
                            return item._id === 'plan';
                        }

                        function findFact(item) {
                            return item._id === 'fact';
                        }
                        var fact = result.find(findFact) || {_id: 'fact', total: 0};
                        var plan = result.find(findPlan) || {_id: 'plan', total: 0};
                        monthData = new MonthData(fact.total, plan.total);
                        res.json(monthData);
                    });
                }
            }
        }
    }));

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

    // @param: String t - timewindow in string representation. In this case strictly 6 chars required.
    api.get( '/day/:t', wagner.invoke(function(Expense) {
        return function( req, res ) {
            var user = req.user;
            if(!user) {
                res.json({ error: "Please, log in" });
            }
            else {
                var t = req.params.t;
                if(t.length !== 8){
                    res.json({error: "wrong day length. 8 chars expected."});
                }
                else {
                    var d = MyDates.getDateFromString(t);
                    var m = MyDates.getMonthFromString(t);
                    var y = MyDates.getYearFromString(t);
                    var agg = [
                        {$match: {user: user._id.toString(), "labels.isDeleted": false}},
                        {$project: {_id:1, amount:1, description:1, date:1, labels:1, year: {$year:"$date"}, month: {$month:"$date"},day: {$dayOfMonth: "$date"}, isPlanned: {$cond:{if:{$eq:["$labels.isConfirmed",false]}, then:1, else:0}}}},
                        {$match: {year: y, month: m, day: d}},
                        {$project: { _id:1, amount:1, description:1, labels:1, date: "$date",isPlanned: "$isPlanned"}}
                    ];
                    Expense.aggregate(agg).exec( function(err, result){
                        if(err) { console.log(err) }
                        res.json(result);
                    });
                }
            }
        }
    }));

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


    return api;
};

module.exports = routes;