var mongoose = require( 'mongoose' );

// exports user object model

var categorySchema = new mongoose.Schema( {
    
    _id: { type: Number, required: true },
    //id: { type: Number, required: true },
    name: { type: String, required: true },
    className: { type: String, required: true }
});

module.exports = categorySchema;
module.exports.categorySchema = categorySchema;