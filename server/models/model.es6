var mongoose = require( 'mongoose' );
var _ = require( 'underscore' );

module.exports = function(wagner){

    // set up connection to Database with Mongoose

    var config = wagner.invoke( function(Config) { return Config });
    mongoose.connect( config.db.dbURL );

    // get all schemas
    // compile then into the models
    // var Expense = mongoose.model('Expense', require( './expense.schema.js' ), 'expenses' );
    //
    // var Currency = mongoose.model('Currency', require( './currency.schema.js' ), 'currencies' );
    //
    // var Category = mongoose.model('Category', require( './category.schema.js' ), 'categories' );

    var User = mongoose.model('User', require( './userSchema.js' ), 'users' );

    var Message = mongoose.model('Message', require('./messageSchema.js'), 'messages');

    // var Payload = mongoose.model('Payload', require('./payload.schema'), 'payloads');

    var models = {
        User: User,
        // Expense: Expense,
        // Currency: Currency,
        // Category: Category,
        Message: Message,
        // Payload: Payload
    };

    // register all models in wagner with undescore
    _.each( models, function( value, key ) {
        wagner.factory( key, function() { return value; });
    });

    return models;
};