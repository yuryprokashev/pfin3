/**
 *Created by py on 15/11/2016
 */
'use strict';
module.exports = (workerFactory, config) => {
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
        let query = {
            query: {
                'private.oauth': profile.id
            },
            profile: profile
    };
        let worker = workerFactory.worker("updateUser");
        worker.handle(query).then(
            (result) => {
                // console.log('authCallback2 called');
                // console.log(JSON.stringify(result));
                cb(null, result.msg);
                workerFactory.purge(result.worker.id);
            },
            (error) => {
                cb({errorName: 'kafkaResponse contains no user', kafkaResponse: JSON.stringify(error)});
                workerFactory.purge(result.worker.id);
            }
        );
    };

    authController.localAuthCallback = (username, password, done) => {
        // console.log('auth local callback called');
        let query = {
            query: {
                "private.local.login": username
            },
            profile: {}
        };
        let worker = workerFactory.worker("findUser");
        worker.handle(query).then(
            (result) => {
                if(result.msg.private.local.password !== password) {
                    return done(null, false, {message: 'Wrong Password'})
                }
                done(null, result.msg);
                workerFactory.purge(result.worker.id);
            },
            (error) => {
                done({errorName: 'kafkaResponse contains no user', kafkaResponse: JSON.stringify(error)});
                workerFactory.purge(result.worker.id);
            }
        )

    };

    // authController.send = (topic, message) => {
    //     kafkaService.send(topic, message);
    // };
    // authController.subscribe = (topic, callback) => {
    //     kafkaService.subscribe(topic, callback);
    // };

    authController.findOne = (id, done) => {
        let query = {query: {_id: id}, profile: {}};
        let worker = workerFactory.worker("findUser");
        worker.handle(query).then(
            (result) => {
                done(null, result.msg);
                workerFactory.purge(result.worker.id);
            },
            (error) => {
                done({errorName: 'kafkaResponse contains no user', kafkaResponse: JSON.stringify(error)});
                workerFactory.purge(result.worker.id);
            }
        )
    };

    authController.handleError = (errorName, error) => {
        console.log(`${errorName}: ${JSON.stringify(error)}`);
    };


    return authController;
};