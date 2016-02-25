function auth ( User, server, Config ) {
    var passport = require( 'passport' );
    var GoogleStrategy = require( 'passport-google-oauth20').Strategy;

    passport.use( new GoogleStrategy( {
        clientID: Config.GOOGLE_CLIENT_ID,
        clientSecret: Config.GOOGLE_CLIENT_SECRET,
        callbackURL: Config.callbackURL
    },
    function( accessToken, refreshToken, profile, cb ){
        //console.log(profile);
        User.findOneAndUpdate(
            { 'private.oauth': profile.id },
            {
                $set: {
                    'public.name.familyName': profile._json.name.familyName,
                    'public.name.givenName': profile._json.name.givenName,
                    'public.username': profile._json.displayName,
                    'public.picture': profile._json.image.url,
                    'private.google.gender': profile._json.gender,
                    'private.google.language': profile._json.language,
                    'private.google.circledByCount': profile._json.circledByCount
                }
            },
            { 'new': true, upsert: true },
            function( err, user ){
                return cb( err, user );
            }
        );
    }));

    // set middleware for auth, including session storage
    server.use( require( 'express-session' )({ secret: Config.expressSessionSecret }));
    server.use( passport.initialize() );
    server.use( passport.session() );

    // set server routes for auth process

    server.get( Config.authPATH, passport.authenticate( 'google', { scope: ['profile'] } ));

    server.get( Config.authCallbackPATH,
        passport.authenticate( 'google', { failureRedirect: Config.failureAuthRedirectPATH }),
        function (req, res ){
                res.redirect( Config.successAuthRedirectPATH );
        });
    server.get( Config.logoutURL , function (req, res ) {
        req.logout();
        res.redirect('/');
    });

    // configuration of user serialization/ deserialization used then by passport
    passport.serializeUser( function ( user, done ) {
        done( null, user._id );
    });
    passport.deserializeUser( function ( id, done ){
        User.findOne(
            { _id: id }
        ).exec( done );
    });
}

module.exports = auth;