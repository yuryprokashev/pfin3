var mongoose = require( 'mongoose' );

// exports user object model

var currencySchema = new mongoose.Schema( {

    _id: { type: Number, required: true },
    //id: { type: Number, required: true },
    name: { type: String, required: true },
    className: { type: String, required: true }

});

module.exports = currencySchema;
module.exports.currencySchema = currencySchema;

var currencies = [
    { _id: 1, name: 'RUB', className: "fa fa-rub" },
    { _id: 2, name: 'USD', className: "fa fa-usd" },
    { _id: 3, name: 'EUR', className: "fa fa-eur" }
];