//var m = require( './models/model.js');
var bodyparser = require( 'body-parser' );
var express = require( 'express' );
var status = require( 'http-status' );
var _ = require( 'underscore' );

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

    // http://localhost:3000/api/v1/charts/20161
    api.get( '/charts/:monthId', wagner.invoke( function( Expense, myDates ) {
        return function( req, res ){
            var user = req.user;
            if (!user) { res.json({ error: "Please, log in" }); }

            else {
                // 1 Setup.
                var mId = req.params.monthId;
                console.log(typeof mId);
                var month = myDates.getMonth( mId );
                var charts = {};

                // 2. Logic

                if ( myDates.monthIdIsValid( mId ) ) {

                    var makePlotlyTrace = function( traceName, arr, type, monthIdString ) {
                        var trace = { x: [], y: [], type: type };
                        console.log(arr);

                        for( var i = 1; i <= myDates.daysInMonth( monthIdString ); i++ ) {
                            trace.x.push( i );
                            for( var j in arr ){
                                if( !trace.y[i] && arr[j]._id === i ) {
                                    trace.y[i] = arr[j][traceName];
                                }
                                else if( !trace.y[i] && arr[j]._id !== i) {
                                    trace.y[i] = 0;
                                }
                            }
                        }
                        return trace;
                    };

                    var baseAgg = [
                        { $match: { user: user._id.toString() } },
                        { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
                        { $match: { month: month + 1 } }
                    ];

                    baseAgg.push(
                        { $project: { amount: 1, day: { $dayOfMonth: "$date" } } },
                        { $group: { _id: "$day", dailyVolumes: { $sum:"$amount" } } },
                        { $sort: { _id: 1 } }
                    );

                    Expense.aggregate( baseAgg ).exec( function( err, result ){
                        if( err ) {
                            res.send(err);
                        }
                        else {
                            charts['dailyVolumes'] = makePlotlyTrace('dailyVolumes', result, 'bar', mId);
                        };
                    });

                    baseAgg.pop(-1);
                    baseAgg.pop(-1);
                    baseAgg.pop(-1);

                    baseAgg.push(
                        { $group: {_id: "$month", monthlyTotal: { $sum: "$amount" } } },
                        { $project: { monthlySpentSpeed: { $ceil: { $divide: [ "$monthlyTotal", myDates.getDaysInSelectedMonth( mId) ] } } } }
                    );

                    Expense.aggregate( baseAgg ).exec( function( err, result ){
                        if( err ) { res.send(err); }
                        else {
                            charts['monthlySpentSpeed'] = makePlotlyTrace('monthlySpentSpeed', result, 'scatter', mId);
                            res.json(charts);
                        }
                    });
                }
                else { console.error('wrong monthId length is passed to api'); }
            }
        }
    }));


    return api;
};

module.exports = routes;