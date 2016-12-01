/**
 *Created by py on 15/11/2016
 */
'use strict';
module.exports = (authController, config) => {
    const express = require('express');
    const expressSession = require('express-session');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const GS = require('passport-google-oauth20').Strategy;
    const FS = require('passport-facebook').Strategy;
    const LS = require('passport-local').Strategy;

    let gs = new GS({
        clientID: config.passport.google.GOOGLE_CLIENT_ID,
        clientSecret: config.passport.google.GOOGLE_CLIENT_SECRET,
        callbackURL: config.passport.google.callbackURL
    }, authController.authCallback);
    let fs = new FS({
        clientID: config.passport.facebook.FACEBOOK_APP_ID,
        clientSecret: config.passport.facebook.FACEBOOK_APP_SECRET,
        callbackURL: config.passport.facebook.callbackURL,
        profileFields: config.passport.facebook.profileFields,
        enableProof: true
    }, authController.authCallback);
    let ls = new LS(authController.localAuthCallback);

    authController.use(gs);
    authController.use(fs);
    authController.use(ls);

    let authApp = new express.Router();
    authApp.use(cookieParser());
    authApp.use(bodyParser.urlencoded({ extended: false }));
    authApp.use(bodyParser.json());
    authApp.use(expressSession({secret: config.express.session.secret}));
    authApp.use(authController.initialize());
    authApp.use(authController.session());

    authApp.get('/auth/:authProvider', authController.authenticate);
    authApp.get('/auth/:authProvider/callback', authController.login);
    authApp.get('/auth/all/logout', authController.logout);
    authApp.post('/test/login', authController.loginLocal); //TODO. Call authController.login here
    return authApp;
};