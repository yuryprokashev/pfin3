var mongoose = require( 'mongoose' );
var _ = require( 'underscore' );

module.exports = function( wagner ){

    // set up connection to Database with Mongoose

    var config = wagner.invoke( function(Config) { return Config });
    mongoose.connect( config.dbURL );

    var PlotlyTracer = wagner.invoke( function( PlotlyTracer ) { return PlotlyTracer; } );

    var MyDates = wagner.invoke(function( MyDates ) { return MyDates; } );

    // get all schemas
    // compile then into the models
    var Expense = mongoose.model( 'Expense', require( './expense.schema' ), 'expenses' );

    Expense.aggPipelineDailyVolumes = function( user, monthIdString, obj, callback ) {
        // 1. Setup

        var month = MyDates.getMonth( monthIdString );

        var agg = [
            { $match: { user: user._id.toString() } },
            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
            { $match: { month: month + 1 } },
            { $project: { amount: 1, day: { $dayOfMonth: "$date" } } },
            { $group: { _id: "$day", dailyVolumes: { $sum:"$amount" } } },
            { $sort: { _id: 1 } }
        ];

        // 2. Logic
        Expense.aggregate( agg ).exec( function( err, result ){
            if( err ) {
                console.log( err );
            }
            else {
                // TODO. This is callback 1 function, which is called after successful completion of query function. Put it instead of ... above
                obj['dailyVolumes'] = PlotlyTracer.makePlotlyTrace('dailyVolumes', result, 'bar', monthIdString);
                if( callback ) {
                    callback();
                }
            }
        });
    };

    Expense.aggPipelineMonthlySpentSpeed = function( user, monthIdString, obj, callback ) {
        // 1. Setup
        var month = MyDates.getMonth( monthIdString );
        var agg = [
            { $match: { user: user._id.toString() } },
            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" } } },
            { $match: { month: month + 1 } },
            { $group: {_id: "$month", monthlyTotal: { $sum: "$amount" } } },
            { $project: { monthlySpentSpeed: { $ceil: { $divide: [ "$monthlyTotal", MyDates.getDaysInSelectedMonth( monthIdString ) ] } } } }
        ];

        // 2. Logic
        Expense.aggregate( agg ).exec( function( err, result ){
            if( err ) { console.log( err ); }
            else {
                // TODO. This is callback 2 function, which is called after successful completion of query function. Put it instead of ... above
                obj['monthlySpentSpeed'] = PlotlyTracer.makePlotlyTrace('monthlySpentSpeed', result, 'scatter', monthIdString );
                if( callback ) {
                    callback();
                }
            }
        });
    };

    var Currency = mongoose.model( 'Currency', require( './currency.schema' ), 'currencies' );

    var Category = mongoose.model( 'Category', require( './category.schema' ), 'categories' );

    var User = mongoose.model( 'User', require( './user.schema' ), 'users' );

    var models = {
        User: User,
        Expense: Expense,
        Currency: Currency,
        Category: Category
    };

    // register all models in wagner with undescore
    _.each( models, function( value, key ) {
        wagner.factory( key, function() { return value; });
    });

    return models;
};