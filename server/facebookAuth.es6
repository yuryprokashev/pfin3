/**
 * Created by py on 15/10/16.
 */

"use strict";
// const Express = require('express');
// const fbAuthServer = Express.Router();

function facebookAuth(User, server, Config){
    const passport = require('passport');
    const FacebookStrategy = require('passport-facebook');

    let fbs = new FacebookStrategy({
        clientID: Config.passport.fb.FACEBOOK_APP_ID,
        clientSecret: Config.passport.fb.FACEBOOK_APP_SECRET,
        callbackURL: Config.passport.fb.callbackURL,
        profileFields: ['id', 'first_name', 'last_name', 'gender', 'picture', 'emails', 'hometown', 'locale'],
        enableProof: true
    }, authenticateWithFB);

    function authenticateWithFB(accessToken, refreshToken, profile, cb) {
         console.log(JSON.stringify(profile._json));
         User.findOneAndUpdate(
             {'private.oauth': profile.id},
             {
                 $set: {
                     'public.name.familyName': profile._json.last_name || null,
                     'public.name.givenName': profile._json.first_name || null,
                     'public.username': `${profile._json.first_name} ${profile._json.last_name}` || null,
                     'public.picture': profile._json.picture.data.url || null,
                     'private.facebook.gender': profile._json.gender || null,
                     'private.facebook.language': profile._json.language || null,
                     'private.facebook.email': profile._json.email,
                     // 'settings.defaults.currency': require('./models/setCurrencyFromLocale')(profile._json.locale),
                 }
             },
             {'new': true, upsert: true},
             function(err, user){
                 return cb(err, user);
             }
         );
    }

     passport.use(fbs);

    // set middleware for auth, including session storage
    server.use( require( 'express-session' )({ secret: Config.passport.expressSessionSecret }));
    server.use( passport.initialize() );
    server.use( passport.session() );


    // set server routes for auth process
    server.get(Config.passport.fb.authPATH, passport.authenticate('facebook', {scope:['email', 'user_about_me']}));

    function redirectOnAuthSuccess(req, res){
        res.redirect(Config.passport.fb.successAuthRedirectPATH);
    }

    server.get(
        Config.passport.fb.authCallbackPATH,
        passport.authenticate(
            'facebook',
            {failureRedirect: Config.passport.fb.failureAuthRedirectPATH}
            ),
        redirectOnAuthSuccess
    );

    function logout(req, res){
        req.logout();
        res.redirect('/');
    }

    server.get(
        Config.passport.fb.logoutURL,
        logout
    );

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
module.exports = facebookAuth;