var mongoose = require( 'mongoose' );
var User = require( './user.schema' );
var Category = require( './category.schema' );
var Currency = require( './currency.schema' );

// exports expense object model
var expenseSchema = new mongoose.Schema( {
    
    _id: { type: String, required: true },
    
    description: { type: String, required: false },
    
    //category: Category.categorySchema,
    category: { type: Number, ref: 'Category' },

    date: { type: Date, required: true },
    
    createdAt: { type: Date, required: true, default: Date.now },
    
    amount: { type: Number, required: true },
    
    //currency: Currency.currencySchema,
    currency: { type: Number, ref: 'Currency' },
    user: { type: String, ref: 'User' }
});

expenseSchema.set( 'toObject', { virtuals: true });
expenseSchema.set( 'toJSON', { virtuals: true });

module.exports = expenseSchema;