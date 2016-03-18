//var m = require( './models/model.js');
var bodyparser = require( 'body-parser' );
var express = require( 'express' );
var status = require( 'http-status' );
var _ = require( 'underscore' );
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

    // api routes

    api.get( '/me', function ( req, res ) {
        if(!req.user) {
            return res.status( status.UNAUTHORIZED ).json( { error: 'not logged in' });
        }
        //console.log(req.user);
        res.json( { user: req.user } );
    });

    api.get( '/expenses/:monthId', wagner.invoke( function( Expense ) {
        return function( req, res ){
            var user = req.user;
            if (!user) { res.json({ error: "Please, log in" }); }

            else {
                var mId = req.params.monthId;

                if ( ( mId.length === 6 ) || ( mId.length === 5 ) ) {
                    var year = mId.substring(0,4);
                    var month = mId.length === 6 ? mId.substring(4,6) : mId.substring(4,5);
                    var nextMonth = Number(month) + 1;

                    //console.log(req.user);

                    Expense.find().
                    where( 'user' ).equals( req.user._id ).
                    where( 'date' ).gte( new Date( year, month, 1)).lte( new Date( year, nextMonth, 0 )).
                    populate( 'category currency' ).
                    sort('-date').
                    exec( function (err, result){
                        if(err) { res.send(err); }
                        if(!result) { res.send('No results found'); }
                        else { res.json(result); }
                    });
                }
                else { console.error('wrong monthId length is passed to api'); }
            }
        }
    }));

    api.post( '/expenses', wagner.invoke( function( Expense ) {
        return function( req, res ) {
            var e = req.body;
            //console.log(e);

            Expense.create({
                _id: require( './guid' )(),
                date: e.date,
                amount: e.amount,
                currency: e.currency,
                category: e.category,
                description: e.description,
                user: e.user
            },
            function( err, result ){
                if( err ){ return console.error( err ) }
                Expense.find().
                where('_id').equals( result._id).
                populate('currency category').
                    exec( function ( err, result ) {
                    if(err) { res.send (err); }
                    if(!result) { res.send('No results found'); }
                    else{ res.json( { expense: result[ 0 ] } ); }
                });
            });
        }
    }));

    api.delete( '/expenses/:id', wagner.invoke( function( Expense ){
        return function (req, res) {
            var _id = req.params.id;
            Expense.findByIdAndRemove( _id, function deleteCallback ( err ) {
                if (err) { res.json(err) }
                res.json({ _id: _id, status: true });
            });
        }
    }));

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

                    if( err ) { res.send(err); };

                    if( data ) {
                        results[ name ] = data;
                        res.json( results );
                    }
                    else { res.send('No results found for ' + name); }
                });
            }
        }
    }));

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
                            { $match: { user: user._id.toString() } },
                            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
                            { $match: { month: month + 1 } },
                            { $project: { amount: 1, day: { $dayOfMonth: "$date" } } },
                            { $group: { _id: "$day", dailyVolumes: { $sum:"$amount" } } },
                            { $sort: { _id: 1 } }
                        ],
                        [
                            { $match: { user: user._id.toString() } },
                            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
                            { $match: { month: month + 1 } },
                            { $group: {_id: "$month", monthlyTotal: { $sum: "$amount" } } },
                            { $project: { monthlySpentSpeed: { $ceil: { $divide: [ "$monthlyTotal", MyDates.getDaysInSelectedMonth( mId ) ] } } } }
                        ]
                    ],
                    categoryVolumes: [
                        // [
                        //     { $match: { user: user._id.toString() } },
                        //     { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" }, category: 1 } },
                        //     { $match: { month: month + 1 } },
                        //     { $group: { _id: "$category", categoryVolume: { $sum: "$amount" } } },
                        //     { $sort : { _id : 1 } }
                        // ],
                        [
                            { $match: { user: user._id.toString() } },
                            { $lookup: {from:"categories", localField:"category", foreignField:"_id", as: "categoryName"}},
                            { $unwind: "$categoryName"},
                            { $project: { _id: 0, amount:1, date:1, month: {$month: "$date"}, "categoryName.name": 1}},
                            { $match: {month: month + 1}},
                            { $group: {_id: "$categoryName.name", categoryVolume: {$sum: "$amount"}}},
                            { $sort : { _id : 1 } }
                        ]
                    ],
                    expenseFrequency: [
                        [
                            { $match: { user: user._id.toString() } },
                            { $lookup: {from:"categories", localField:"category", foreignField:"_id", as: "categoryName"}},
                            { $unwind: "$categoryName"},
                            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" }, "categoryName.name": 1 } },
                            { $match: { month: month + 1 } },
                            { $group: { _id: "$categoryName.name", expenseFrequency: { $sum: 1 } } },
                            { $sort : { _id : 1 } }
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
                            myEmitter.emit(chartName+'TraceReady', result);
                        });
                    }

                    // Here we get the trace, push it to 'traces' array and check, if we finished
                    // Once finished -> we send 'ChartReady' event

                    myEmitter.on(chartName+'TraceReady', function( trace ){
                        // console.log('------------Trace is Ready------------');
                        // console.log(trace);
                        rawTraces.push(trace);
                        // console.log('rawTraces.length is now: '+ rawTraces.length);
                        // console.log('--------------------------------------');
                        var plotlyTraces = [];

                        for( var i in rawTraces ) {

                            // console.log('trace#'+i);
                            PlotlyTracer.makePlotlyTrace(chartName, rawTraces[i], mId, function(plotlyTrace) {
                                // console.log('-------rawTraces before-------');
                                // console.log(rawTraces.toString());
                                plotlyTraces[i] = plotlyTrace;
                                // console.log('plotlyTraces.length = ' + plotlyTraces.length);
                                if( plotlyTraces.length === aggQueries[chartName].length) {
                                    // console.log('-------rawTraces after-------')
                                    // console.log(rawTraces.toString());
                                    myEmitter.emit(chartName+'ChartReady', plotlyTraces);
                                    // console.log('--------------------------------------');
                                    // console.log('Emitting ChartReady!');
                                }
                            } );
                            // console.log(rawTraces[i]);
                        }

                        // myEmitter.emit(chartName+'ChartReady', plotlyTraces);

                        // if( plotlyTraces.length === aggQueries[chartName].length) {
                        //     console.log('------------Making Plotly Traces------------');
                        //     for( var i in rawTraces ) {
                        //
                        //         console.log('trace#'+i);
                        //         PlotlyTracer.makePlotlyTrace(chartName, rawTraces[i], mId, function(plotlyTrace) {
                        //             console.log('-------rawTraces before-------');
                        //             console.log(rawTraces.toString());
                        //             plotlyTraces[i] = plotlyTrace;
                        //             console.log('-------rawTraces after-------')
                        //             console.log(rawTraces.toString());
                        //             // myEmitter.emit(chartName+'ChartReady', rawTraces);
                        //         } );
                        //         console.log(rawTraces[i]);
                        //     }
                        //     console.log('--------------------------------------');
                        //     console.log('Emitting ChartReady!');
                        //     myEmitter.emit(chartName+'ChartReady', plotlyTraces);
                        //
                        // }
                    });

                    // Here we send a response, when Chart is ready.
                    myEmitter.once(chartName+'ChartReady', function( obj ){
                        // console.log('------------Send Chart------------');
                        // console.log('chart is ready');
                        charts.traces = obj;
                        rawTraces = [];
                        myEmitter.removeAllListeners(chartName+'TraceReady');
                        res.json(charts);
                        // console.log(charts.traces);
                        // console.log('--------------------------------------');
                        // console.log('------------Listeners Remaining------------');
                        // console.log(myEmitter.listeners(chartName+'TraceReady').toString());
                        // console.log('--------------------------------------');

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

    api.get( '/charts/meta', wagner.invoke( function( Config ) {
        return function( req, res ){
            res.json( Config.plotly );
        }
    }));

    // TODO. api method for arbitrary quantity of guids generation and saving it to file.
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

    // TODO. api method for translating the strings to dates objects in expenses collection
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

    return api;
};

module.exports = routes;