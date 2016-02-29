//var m = require( './models/model.js');
var bodyparser = require( 'body-parser' );
var express = require( 'express' );
var status = require( 'http-status' );
var _ = require( 'underscore' );

var routes = function( wagner ) {

    var api = express.Router();

    api.use( bodyparser.json() );

    // api routes
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

    api.delete( '/expenses/:id', wagner.invoke( function(Expense){
        return function (req, res) {
            var _id = req.params.id;
            Expense.findByIdAndRemove( _id, function deleteCallback ( err ) {
                if (err) { res.json(err) }
                res.json({ _id: _id, status: true });
            });
        }
    }));

    // TODO. Get all Categories and Currencies for Expense
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


    // TODO. Get data for Chart1, Chart2, Chart3 and Chart4
    api.get( '/chart/:id', function( req, res ){

    });

    api.get( '/me', function ( req, res ) {
        if(!req.user) {
            return res.status( status.UNAUTHORIZED ).json( { error: 'not logged in' });
        }
        //console.log(req.user);
        res.json( { user: req.user } );
    });

    return api;
};

module.exports = routes;