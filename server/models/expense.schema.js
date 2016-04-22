var mongoose = require( 'mongoose' );
var User = require( './user.schema' );
var Category = require( './category.schema' );
var Currency = require( './currency.schema' );

// exports expense object model
var expenseSchema = new mongoose.Schema( {
    
    _id: { type: String, required: true },
    
    description: { type: String, required: false },
    
    //category: Category.categorySchema,
    // category: { type: Number, ref: 'Category', default: 1 },

    date: { type: Date, required: true },
    
    createdAt: { type: Date, required: true, default: Date.now },
    
    amount: { type: Number, required: true },
    
    //currency: Currency.currencySchema,
    // currency: { type: Number, ref: 'Currency', default: 1 },

    user: { type: String, ref: 'User' },
    
    // isDeleted: { type: Boolean, required: true, default: false }

    labels: {
        isDeleted: { type: Boolean, required: true, default: false },
        isConfirmed: { type: Boolean, required: true, default: false },
        isDefault: { type: Boolean, required: true, default: false }
        // isRejected: { type: Boolean }
    }
});

expenseSchema.set( 'toObject', { virtuals: true });
expenseSchema.set( 'toJSON', { virtuals: true });

module.exports = expenseSchema;