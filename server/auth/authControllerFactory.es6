/**
 *Created by py on 15/11/2016
 */
'use strict';
module.exports = (kafkaService, config) => {
    const passport = require('passport');
    const status = require('http-status');

    let cache = new Map();
    passport.serializeUser((user, done) => {
        // console.log(`serialized user ${user._id}`);
        cache.set(user._id, {user: user, createdAt: new Date().valueOf()});
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        // console.log('deseriaizing user...');
        if(cache.has(id)) {
            return done(null, cache.get(id).user);

        }
        else {
            authController.findOne(id, done);
        }
    });

    let extract = (property, kafkaMessage) => {
        const extract = require('./../helpers/extractPropertyFromKafkaMessage.es6');
        return extract(property, kafkaMessage);
    };

    let authController = {};

    authController.use = (strategy) => {
        passport.use(strategy);
    };
    authController.initialize = (options) => {
        return passport.initialize(options);
    };
    authController.session = () => {
        return passport.session();
    };

    authController.authenticate = (request, response, next) => {
        let strategy = request.params.authProvider;
        let scope = config.passport[strategy].scope;
        passport.authenticate(
            strategy,
            {scope: scope},
            (err, user, info) => {
                // console.log('authenticate executing...');
                if(err) {return next(err);}
                if(!user) {
                    return response.redirect('/');
                }
                request.logIn(user, (err) => {
                    // console.log('user ok in authenticate');
                    if(err) {return next(err);}
                    return response.redirect(config.passport[strategy].authCallbackPath);
                });
            })(request, response, next);
    };
    authController.login = (request, response, next) => {
        console.log('authController.login executing...');
        let strategy = request.params.authProvider;
        passport.authenticate(
            strategy,
            (err, user, info) => {
                if(err) {return next(err);}
                if(!user) {
                    console.log('no user');
                    return response.redirect('/');
                }

                request.logIn(user, function (err) {
                    console.log('logging user in...');
                    // console.log(request.session.passport.user);
                    if(err) {return next(err);}
                    response.redirect(config.passport[strategy].successAuthRedirectPATH);
                });
        })(request, response, next);

    };
    authController.loginLocal = (request, response, next) =>{
        passport.authenticate(
            'local',
            (err, user, info)=>{
                if(err) {return next(err);}
                if(!user) {
                    console.log('no user for local');
                    return response.redirect('/');
                }
                request.logIn(user, (err)=>{
                    console.log('logging in with local');
                    if(err){return next(err);}
                    response.redirect('/#/log-and-plan');
                });
            })(request, response, next);
    };
    authController.logout = (request, response) => {
        cache.delete(request.user._id);
        request.logout();
        response.redirect('/');
    };

    authController.authCallback = (accessToken, refreshToken, profile, cb) => {
        // console.log('authCallback called');
        let requestId = new Date().valueOf().toString();
        authController.subscribe('user-find-one-and-update-response', (message) => {
            let user = extract('user', message);
            // console.log(message);
            let responseRequestId = extract('request.id', message);
            // console.log(responseRequestId);
            if(requestId === responseRequestId) {
                if(!user) {
                    authController.handleError('user update failed', message);
                    return cb({errorName: 'kafkaResponse contains no user', kafkaResponse: JSON.stringify(message)});
                }
                // console.log(cb);
                return cb(null, extract('user', message));
            }
        });
        authController.send('user-find-one-and-update-request', {
            request: {
                id : requestId
            },
            profile: profile,
            query: {
                'private.oauth': profile.id
            }
        });
    };

    authController.localAuthCallback = (username, password, done) => {
        let requestId = new Date().valueOf().toString();
        authController.subscribe('user-find-one-response', (kafkaResponse) => {
            let user = extract('user', kafkaResponse);
            let err = null;
            if(!user) {
                err = {errorName: 'kafkaResponse contains no user', kafkaResponse: JSON.stringify(kafkaResponse)};
                return done(null, false, {message: err});
            }
            if(user.private.local.password !== password) {
                return done(null, false, {message: 'Wrong Password'})
            }

            return done(err, user);
        });
        authController.send('user-find-one-request', {
            query:{
                "private.local.login": username
            },
            profile: {},
            request: {
                id: requestId
            }
        });
    };

    authController.send = (topic, message) => {
        kafkaService.send(topic, message);
    };
    authController.subscribe = (topic, callback) => {
        kafkaService.subscribe(topic, callback);
    };

    authController.findOne = (id, done) => {
        let requestId = new Date().valueOf().toString();
        authController.subscribe('user-find-one-response', (kafkaResponse) => {
            let user = extract('user', kafkaResponse);
            let err = null;
            if(!user) {
                err = {errorName: 'kafkaResponse contains no user', kafkaResponse: JSON.stringify(kafkaResponse)};
            }
            return done(err, user);
        });
        authController.send('user-find-one-request', {
            query:{
                _id: id
            },
            profile: {},
            request: {
                id: requestId
            }
        });
    };

    authController.handleError = (errorName, error) => {
        console.log(`${errorName}: ${JSON.stringify(error)}`);
    };

    return authController;
};