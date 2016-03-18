var mongoose = require( 'mongoose' );
var _ = require( 'underscore' );

module.exports = function( wagner ){

    // set up connection to Database with Mongoose

    var config = wagner.invoke( function(Config) { return Config });
    mongoose.connect( config.db.dbURL );

    // get all schemas
    // compile then into the models
    var Expense = mongoose.model( 'Expense', require( './expense.schema' ), 'expenses' );

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