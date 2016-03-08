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
                obj['dailyVolumes'] = PlotlyTracer.makePlotlyTrace('dailyVolumes', result, monthIdString);
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
                obj['monthlySpentSpeed'] = PlotlyTracer.makePlotlyTrace('monthlySpentSpeed', result, monthIdString );
                if( callback ) {
                    callback();
                }
            }
        });
    };

    Expense.aggPipelineVolumesByCategory = function( user, monthIdString, obj, callback ) {
        // 1. Setup
        var month = MyDates.getMonth( monthIdString );
        var agg = [
            { $match: { user: user._id.toString() } },
            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" }, category: 1 } },
            { $match: { month: month + 1 } },
            { $group: { _id: "$category", categoryVolume: { $sum: "$amount" } } },
            { $sort : { _id : 1 } }
        ];

        // 2. Logic
        Expense.aggregate( agg ).exec( function( err, result ){
            if( err ) { console.log( err ); }
            else {
                obj['volumesByCategory'] = PlotlyTracer.makePlotlyTrace('volumesByCategory', result, monthIdString );
                //obj['volumesByCategory'] = result;

                if( callback ) {
                    callback();
                }
            }
        });
    };

    Expense.aggPipelineFrequencyByCategory = function( user, monthIdString, obj, callback ) {
        // 1. Setup
        var month = MyDates.getMonth( monthIdString );
        var agg = [
            { $match: { user: user._id.toString() } },
            { $project: { _id: 0, amount: 1, date: 1, month: { $month: "$date" }, category: 1 } },
            { $match: { month: month + 1 } },
            { $group: { _id: "$category", expenseFrequency: { $sum: 1 } } },
            { $sort : { _id : 1 } }
        ];

        // 2. Logic
        Expense.aggregate( agg ).exec( function( err, result ){
            if( err ) { console.log( err ); }
            else {
                obj['expenseFrequency'] = PlotlyTracer.makePlotlyTrace('expenseFrequency', result, monthIdString );
                //obj['expenseCount'] = result;
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