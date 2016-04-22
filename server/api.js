//var m = require( './models/model.js');
var bodyparser = require( 'body-parser' );
var express = require( 'express' );
var status = require( 'http-status' );
var _ = require( 'underscore' );
var http = require('axios').create({
    baseURL: 'http://localhost:5000',
    timeout: 5000
});
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
    EventEmitter.call(this);
}
util.inherits( MyEmitter, EventEmitter );
const myEmitter = new MyEmitter();

var routes = function( wagner ) {

    var api = express.Router();

    api.use( bodyparser.json() );

    // API for User data
    api.get( '/me', function ( req, res ) {
        if(!req.user) {
            return res.status( status.UNAUTHORIZED ).json( { error: 'not logged in' });
        }
        //console.log(req.user);
        res.json( { user: req.user } );
    });


    // API for CRUD operations with Expense facts

    // api that gets all expenses for given user and specified monthId.
    api.get( '/expenses/:monthId', wagner.invoke( function( Expense ) {
        return function( req, res ){
            var user = req.user;
            if (!user) { res.json({ error: "Please, log in" }); }

            else {
                var mId = req.params.monthId;

                if ( ( mId.length === 6 ) || ( mId.length === 5 ) ) {
                    var month = mId.length === 6 ? mId.substring(4,6) : mId.substring(4,5);
                    // var agg = [
                    //     {$match: {user: user._id.toString(), "labels.isDeleted": false}},
                    //     {$project: {_id:1, amount:1, description:1, date:1, labels:1, month: {$month: "$date"}}},
                    //     {$match: {month: Number(month) + 1}},
                    //     {$project: { _id:1, amount:1, description:1, labels:1, day: {$dayOfMonth: "$date"}}},
                    //     {$group: {_id:"$day", dayTotal: {$sum: "$amount"}, dayCount:{$eq:{"labels.isConfirmed": false, $sum: 1}}, expenses: {$push:{_id:"$_id", amount:"$amount", description:"$description", labels: "$labels"}}}},
                    //     {$sort: {_id: 1}}
                    // ];

                    var agg = [
                        {$match: {user: user._id.toString(), "labels.isDeleted": false}},
                        {$project: {_id:1, amount:1, description:1, date:1, labels:1, month: {$month: "$date"}, isRecommended: {$cond:{if:{$eq:["$labels.isConfirmed",true]}, then:0, else:1}}}},
                        {$match: {month: Number(month) + 1}},
                        {$project: { _id:1, amount:1, description:1, labels:1, day: {$dayOfMonth: "$date"}, isRecommended: "$isRecommended"}},
                        {$group: {_id:"$day", dayTotal: {$sum: "$amount"}, dayCount: {$sum:"$isRecommended"}, expenses: {$push:{_id:"$_id", amount:"$amount", description:"$description", labels: "$labels"}}}},
                        {$sort: {_id: 1}}
                    ];

                    Expense.aggregate(agg).exec( function(err, result){
                        if(err) { console.log(err) }
                        res.json(result);
                    });
                }
                else { console.error('wrong monthId length is passed to api'); }
            }
        }
    }));

    // api that posts new expense
    api.post( '/expenses', wagner.invoke( function( Expense ) {
        return function( req, res ) {
            var e = req.body;
            //console.log(e);

            Expense.create({
                _id: require( './guid' )(),
                date: e.date,
                amount: e.amount,
                // currency: e.currency,
                // category: e.category,
                description: e.description,
                user: e.user,
                labels: {
                    isConfirmed: true
                }
            },
            function( err, result ){
                if( err ){ return console.error( err ) }
                Expense.find().
                where('_id').equals( result._id).
                // populate('currency category').
                    exec( function ( err, result ) {
                    if(err) { res.send (err); }
                    if(!result) { res.send('No results found'); }
                    else{ res.json( { expense: result[ 0 ] } ); }
                });
            });
        }
    }));

    // api that marks expense with isDeleted flag (->true)
    api.delete( '/expenses/:id', wagner.invoke( function( Expense ){
        return function (req, res) {
            var _id = req.params.id;

            Expense.findByIdAndUpdate( _id, { $set: {
                "labels.isDeleted": true,
                "labels.isConfirmed": false }
            }, { new: true }, function  deleteCalllback ( err, result ) {
                if (err) { res.json(err) }
                res.json({ _id: _id, expense: result, status: true });
            });
        }
    }));


    // API for CRUD operations with Recommended Expenses

    var userHasExpenses = function(user, Expense){

        myEmitter.once(user._id + 'SeeRecommendationList', function(){
            if(!user) {
                myEmitter.emit('UserNotExists');
            }
            else {
                Expense.find().where('user').equals(user._id).
                where('labels.isDeleted').equals(false).
                where('labels.isConfirmed').equals(true).
                exec(function(err, userExpenses){
                    if(err) { console.log(err) }
                    if(!userExpenses){
                        console.log(user._id + 'HasNOExpenses');
                        myEmitter.emit(user._id + 'HasNOExpenses', false);
                    }
                    else {
                        console.log(user._id + 'HasExpenses');
                        myEmitter.emit(user._id + 'HasExpenses', userExpenses);
                    }
                });
            }
        });
    };

    var userHasRecommendations = function(user, Expense) {
        myEmitter.once(user._id + 'HasExpenses', function(userExpenses){
            Expense.find().where('user').equals(user._id).
            where('labels.isDeleted').equals(false).
            where('labels.isConfirmed').equals(false).
            exec(function(err, data){
                // console.log(data);
                // console.log(!data.length);
                if(err) { console.log(err) }
                if(!data.length) {
                    console.log(user._id + 'HasNORecommendations');
                    myEmitter.emit(user._id + 'HasNORecommendations', userExpenses);
                }
                else {
                    console.log(user._id + 'HasRecommendations');
                    myEmitter.emit(user._id + 'HasRecommendations', data);
                }
            });
        });
    };
    
    var userGotRecommendationsToday = function(user) {

        myEmitter.once(user._id + 'HasNORecommendations', function(userExpenses){
            var today = new Date();
            console.log(today.getDate());
            var lastUpdate = user.lastRecommendationSent;
            console.log(lastUpdate.getDate());
            if(today.getFullYear() == lastUpdate.getFullYear() &&
                today.getMonth() == lastUpdate.getMonth() &&
                today.getDate() == lastUpdate.getDate()) {
                console.log(user._id + 'HasNewRecsToday');
                myEmitter.emit(user._id + 'HasNewRecsToday');
            }
            else {
                console.log(user._id + 'HasNONewRecsToday');
                myEmitter.emit(user._id + 'HasNONewRecsToday', userExpenses);
            }
        });
    };

    var askExprecForNewRecommendations = function(user, User, Expense) {
        myEmitter.once(user._id + 'HasNONewRecsToday', function(userExpenses){
            // console.log(userExpenses);
            http.get('/recommend', {
                    params: {
                        input: JSON.stringify(userExpenses)
                    }
                })
                .then(function (response) {
                    var today = new Date();
                    var recs = response.data.recommendations;
                    var recommendations = [];
                    console.log(recs.length);

                    for( var idx in recs ) {
                        // console.log(recs[idx]);
                        Expense.create(
                            {
                                _id: require( './guid' )(),
                                date: today,
                                amount: recs[ idx ].amount,
                                description: recs[ idx ].description,
                                user: user._id,
                                labels: {
                                    isConfirmed: false,
                                    isDeleted: false,
                                    isDefault: false
                                }
                            },
                            function( err, result ){
                                // if( err ){ console.log( err ) }
                                // console.log(result);
                                recommendations.push(result);

                                if(recommendations.length === recs.length) {
                                    console.log(user._id + 'NewRecsReady');
                                    myEmitter.emit(user._id + 'NewRecsReady', recommendations);
                                }
                            }
                        );
                    }

                    User.findByIdAndUpdate( user._id,
                        { $set: { "lastRecommendationSent": today } },
                        { new: true },
                        function  success ( err, result ) {
                            if (err) { console.log(err) }
                        }
                    );
                }).catch(function (response) {
                console.log(response);
            });
        });
    };

    var clearListeners = function(user) {
        var allListenerNames =
            [
                user._id + 'NewRecsError',
                user._id + 'NewRecsReady',
                user._id + 'HasNewRecsToday',
                user._id + 'HasNONewRecsToday',
                user._id + 'HasRecommendations',
                user._id + 'HasNORecommendations',
                user._id + 'HasExpenses',
                user._id + 'HasNOExpenses',
                user._id + 'SeeRecommendationList',
                'UserNotExists'
            ];
        for(var i in allListenerNames) {
            myEmitter.removeAllListeners(allListenerNames[i]);
        }
    };

    var sendResponse = function(user, res, Expense) {
        var result = { recommendations: [] };

        myEmitter.once('UserNotExists', function(){
            console.log('UserNotExists');
            res.json({error: 'Please Log In'});
        });

        // No expenses found (new user). -> Send him default
        myEmitter.once(user._id + 'HasNOExpenses', function(obj){
            Expense.find().
            where('labels.isDefault').equals(true).
            exec(function(err, data) {
                result.recommendations = data;
                console.log(result);
                res.json(result);
                clearListeners(user);
            });
        });

        // User has recommendations, that are not yet confirmed or rejected -> send him those recommendations
        myEmitter.once(user._id + 'HasRecommendations', function (obj) {
            result.recommendations = obj;
            console.log(result);
            res.json(result);
            clearListeners(user);
        });

        // User has already got recommendations today -> send him empty list
        myEmitter.once(user._id + 'HasNewRecsToday', function(){
            console.log(result);
            res.json(result);
            clearListeners(user);
        });

        // pfin got the new recommendations from exprec -> send them to User.
        myEmitter.once(user._id + 'NewRecsReady', function(obj){
            result.recommendations = obj;
            console.log(result);
            res.json(result);
            clearListeners(user);
        });

        // pfin got the error from exprec for some reason -> send error to User
        myEmitter.once(user._id + 'NewRecsError', function (obj) {
            result.error = obj;
            console.log(result);
            res.json(result);
            clearListeners(user);
        });
    };

    var countAllListeners = function(user){
        var allListenerNames = [
            user._id + 'NewRecsError',
            user._id + 'NewRecsReady',
            user._id + 'HasNewRecsToday',
            user._id + 'HasNONewRecsToday',
            user._id + 'HasRecommendations',
            user._id + 'HasNORecommendations',
            user._id + 'HasExpenses',
            user._id + 'HasNOExpenses',
            user._id + 'SeeRecommendationList',
            'UserNotExists'];
        var errata = [];

        for(var i in allListenerNames){
            if(myEmitter.listenerCount(allListenerNames[i]) > 0) {
                errata.push(allListenerNames[i]);
            }
        }

        if(errata.length) {
            console.log('errata');
            console.log(errata);
        }
        return errata.length;
    };

    api.get( '/recommend/expenses', wagner.invoke( function ( Expense, User ) {
        return function(req, res) {

            var user = req.user;
            if(!user){
                myEmitter.emit('UserNotExists');
            }
            else {
                // console.log(req.user._id);
                // console.log('myEmitter has ' + countAllListeners(user));

                // Create functions that listen for my events.
                sendResponse(user, res, Expense);

                userHasExpenses(user, Expense);

                userHasRecommendations(user, Expense);

                userGotRecommendationsToday(user);

                askExprecForNewRecommendations(user, User, Expense);

                // Fire event, that starts the flow.
                myEmitter.emit(user._id + 'SeeRecommendationList');
            }
        };
    }));

    // api that confirms recommended expense and make it factual.
    api.post( '/recommend/expenses', wagner.invoke( function( Expense ) {
        return function( req, res ) {
            var e = req.body;
            // console.log(e);

            Expense.findByIdAndUpdate( e._id,
                { $set: {
                    "labels.isConfirmed": true,
                    "amount": e.amount,
                    "description": e.description }
                }, { new: true }, function  confirmCalllback ( err, result ) {
                if (err) {
                    console.log('error');
                    console.error(err);
                }
                res.json({ _id: e._id, expense: result, status: true });
            });
        }
    }));

    // api that reject recommended expense as deleted.
    api.delete( '/recommend/expenses/:id', wagner.invoke( function( Expense ){
        return function( req, res ) {
            var _id = req.params.id;

            Expense.findByIdAndUpdate( _id, { $set: {
                "labels.isDeleted": true
            } }, { new: true }, function  deleteCalllback ( err, result ) {
                if (err) { res.json(err) }
                res.json({ _id: _id, expense: result, status: true });
            });
        }
    }));


    // API to get Common data (references for Category and Currency)
    // api to get currencies and categories references
    api.get( '/common/:name', wagner.invoke( function( Category, Currency ){
        return function( req, res ){

            var name = req.params.name;
            var isModel = false;

            var model = {};
            var results = {};
            results[ name ] = {};

            if ( name === "categories" ) {
                isModel = true;
                model = Category;
            }
            else if( name === 'currencies' ) {
                isModel = true;
                model = Currency;
            }

            else {
                isModel = false;
                res.send('Model name <b>' + name + '</b> is invalid ' );
            }

            if( isModel ) {
                model.find().exec(function( err, data ){

                    if( err ) { res.send(err) }

                    if( data ) {
                        results[ name ] = data;
                        res.json( results );
                    }
                    else { res.send('No results found for ' + name); }
                });
            }
        }
    }));


    // API to get charts data for dashboard
    // api to get specific chart data (chartName) for specific month (monthId)
    api.get( '/charts/:chartName/:monthId', wagner.invoke( function( Expense, Category, MyDates, Config, PlotlyTracer ) {

        return function( req, res ){
            var user = req.user;
            if (!user) { res.json({ error: "Please, log in" }); }

            else {
                // 1 Setup.
                var mId = req.params.monthId;
                var month = MyDates.getMonth(mId);
                var chartName = req.params.chartName;
                var charts = { chartDiv:"", traces:[] };

                var aggQueries = {
                    // 'dailyVolumes', 'categoryVolumes' and 'expenseFrequency' is 'chartName' parameter passed in api
                    dailyVolumes: [
                        [
                            { $match: { $and: [ { user: user._id.toString() }, { "labels.isDeleted": false}, { "labels.isConfirmed": true} ] } },
                            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
                            { $match: { month: month + 1 } },
                            { $project: { amount: 1, day: { $dayOfMonth: "$date" } } },
                            { $group: { _id: "$day", dailyVolumes: { $sum:"$amount" } } },
                            { $sort: { _id: 1 } }
                        ],
                        [
                            { $match: { $and: [ { user: user._id.toString() }, { "labels.isDeleted": false} ] } },
                            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
                            { $match: { month: month + 1 } },
                            { $group: {_id: "$month", monthlyTotal: { $sum: "$amount" } } },
                            { $project: { monthlySpentSpeed: { $ceil: { $divide: [ "$monthlyTotal", MyDates.getDaysInSelectedMonth( mId ) ] } } } }
                        ]
                    ],
                    categoryVolumes: [
                        [
                            { $match: { $and: [ { user: user._id.toString() }, { "labels.isDeleted": false }, { "labels.isConfirmed": true} ] } },
                            { $lookup:
                                {from:"categories", localField:"category", foreignField:"_id", as: "categoryName"}
                            },
                            { $unwind: "$categoryName"},
                            { $project:
                                { _id: 0, amount:1, date:1, month: {$month: "$date"}, "categoryName.name": 1, "categoryName.color": 1}
                            },
                            { $match: {month: month + 1}},
                            { $group:
                                {_id: "$categoryName.name", categoryVolume: {$sum: "$amount"}, categoryColor: { $first: "$categoryName.color"}}
                            },
                            { $sort : { _id : 1 } }
                        ]
                    ],
                    expenseFrequency: [
                        [
                            { $match: { $and: [ { user: user._id.toString() }, { "labels.isDeleted": false }, { "labels.isConfirmed": true} ] } },
                            { $lookup: {from:"categories", localField:"category", foreignField:"_id", as: "categoryName"}},
                            { $unwind: "$categoryName"},
                            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" }, "categoryName.name": 1 } },
                            { $match: { month: month + 1 } },
                            { $group: { _id: "$categoryName.name", expenseFrequency: { $sum: 1 } } },
                            { $sort : { expenseFrequency : 1 } }
                        ]
                    ]
                };

                // 2. Logic
                if ( MyDates.monthIdIsValid( mId ) ) {

                    charts.chartDiv = chartName;
                    var rawTraces = [];

                    for( var q in aggQueries[ chartName ] ) {
                        //console.log(aggQueries[ chartName ][q]);
                        // Here we start several aggregation tasks, that are async.
                        // Once each of them finishes, it fires the "TraceReady" event with the result object in it.
                        Expense.aggregate(aggQueries[ chartName ][ q ]).exec(function (err, result) {
                            // console.log('error in aggregation function = ' + err);
                            myEmitter.emit(chartName+'TraceReady', result);
                        });
                    }

                    // Here we get the trace, push it to 'traces' array and check, if we finished
                    // Once finished -> we send 'ChartReady' event
                    myEmitter.on(chartName+'TraceReady', function( trace ){
                        rawTraces.push(trace);
                        var plotlyTraces = [];

                        for( var i in rawTraces ) {
                            PlotlyTracer.makePlotlyTrace(chartName, rawTraces[i], mId, function(plotlyTrace) {
                                plotlyTraces[i] = plotlyTrace;
                                if( plotlyTraces.length === aggQueries[chartName].length) {
                                    myEmitter.emit(chartName+'ChartReady', plotlyTraces);
                                }
                            } );
                        }
                    });

                    // Here we send a response, when Chart is ready.
                    myEmitter.once(chartName+'ChartReady', function( obj ){
                        charts.traces = obj;
                        rawTraces = [];
                        myEmitter.removeAllListeners(chartName+'TraceReady');
                        res.json(charts);
                    });
                }
                else {
                    if (MyDates.monthIdIsValid( mId )) {
                        console.log("wrong monthId length is passed to api " + mId);
                    }
                }
            }
        }
    }));

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
            result.push(require('./guid')());
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

            Expense.find().exec( function( err, data ){
                //var dates = [];
                for(var i = 0; i < data.length; i++) {
                    var newDate = Date.parse(data[i].date);
                    Expense.update({_id: data[i]._id}, {date: newDate, createdAt: newDate}, function( err, raw ){
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
        res.json({ guid: require('./guid')() });
    });

    return api;
};

module.exports = routes;