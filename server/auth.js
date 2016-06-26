function auth ( User, server, Config ) {
    var passport = require( 'passport' );
    var GoogleStrategy = require( 'passport-google-oauth20').Strategy;

    passport.use( new GoogleStrategy( {
        clientID: Config.passport.GOOGLE_CLIENT_ID,
        clientSecret: Config.passport.GOOGLE_CLIENT_SECRET,
        callbackURL: Config.passport.callbackURL
    },
    function( accessToken, refreshToken, profile, cb ){
        //console.log(profile);

        // var properties = profile.json.keys();
        // var cookedProfile = {};
        // for(var i in properties){
        //     if(properties[i] !== undefined) {
        //         cookedProfile[properties[i]] = profile.json[properties[i]];
        //     }
        //     else {}
        // }
        //
        // if(profile.json) {
        //     var familyName = profile.json.name.familyName
        // }
        // else {
        //
        // }
        User.findOneAndUpdate(
            { 'private.oauth': profile.id },
            {
                $set: {
                    'public.name.familyName': profile._json.name.familyName || null,
                    'public.name.givenName': profile._json.name.givenName || null,
                    'public.username': profile._json.displayName || null,
                    'public.picture': profile._json.image.url || null,
                    'private.google.gender': profile._json.gender || null,
                    'private.google.language': profile._json.language || null,
                    'private.google.circledByCount': profile._json.circledByCount || 0
                }
            },
            { 'new': true, upsert: true },
            function( err, user ){
                return cb( err, user );
            }
        );
    }));

    // set middleware for auth, including session storage
    server.use( require( 'express-session' )({ secret: Config.passport.expressSessionSecret }));
    server.use( passport.initialize() );
    server.use( passport.session() );

    // set server routes for auth process

    server.get( Config.passport.authPATH, passport.authenticate( 'google', { scope: ['profile'] } ));

    server.get( Config.passport.authCallbackPATH,
        passport.authenticate( 'google', { failureRedirect: Config.passport.failureAuthRedirectPATH }),
        function (req, res ){
                res.redirect( Config.passport.successAuthRedirectPATH );
        });
    server.get( Config.passport.logoutURL , function (req, res ) {
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