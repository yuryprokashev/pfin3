var mongoose = require( 'mongoose' );

// exports user object model

var userSchema = new mongoose.Schema( {

    public: {
        username: {
            type: String,
            required: true,
            lowercase: true
        },
        name: {
            familyName: {
                type: String,
                required: true
            },
            givenName: {
                type:String,
                required: true
            }
        },

        picture: {
            type: String,
            match: /^https:\/\//i
        }
    },

    private: {
        google: {
            gender: {
                type: String
            },
            language: {
                type: String
            },
            circledByCount:{
                type: Number
            }
        },
        oauth: {
            type: String
        },
        loginCount: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    }
});

module.exports = userSchema;
module.exports.userSchema = userSchema;