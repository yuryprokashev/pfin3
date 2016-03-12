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

    api.get( '/charts/:monthId', wagner.invoke( function( Expense, MyDates, Config, PlotlyTracer ) {
        return function( req, res ){
            var user = req.user;
            if (!user) { res.json({ error: "Please, log in" }); }

            else {
                // 1 Setup.
                var mId = req.params.monthId;
                var charts = {
                    layout: Config.plotly
                };

                // 2. Logic

                if ( MyDates.monthIdIsValid( mId ) ) {

                    Expense.aggPipelineDailyVolumes( user, mId, function success( result ){
                        charts['dailyVolumes'] = PlotlyTracer.makePlotlyTrace('dailyVolumes', result, mId);
                    });

                    Expense.aggPipelineVolumesByCategory( user, mId, function success( result ){
                        charts['volumesByCategory'] = PlotlyTracer.makePlotlyTrace('volumesByCategory', result, mId );
                    });

                    Expense.aggPipelineFrequencyByCategory( user, mId, function success( result ){
                        charts['expenseFrequency'] = PlotlyTracer.makePlotlyTrace('expenseFrequency', result, mId );
                    });

                    Expense.aggPipelineMonthlySpentSpeed( user, mId, function success( result ) {
                        charts['monthlySpentSpeed'] = PlotlyTracer.makePlotlyTrace('monthlySpentSpeed', result, mId );

                        res.json( charts );
                    } );


                }
                else { console.error('wrong monthId length is passed to api'); }
            }
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