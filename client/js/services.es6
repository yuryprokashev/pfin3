'use strict';

var status = require('http-status');

// $views service returns AppView model
exports.$views = function ($http) {

    var AppView = require('./AppView.es6');

    var s = {};

    var appView = new AppView();

    s.initAppView = function (state) {
        appView.init(state);
        return appView;
    };

    return s;
};

exports.$user = function ($http) {
    var s = { user: {} };
    s.getUser = function (callback) {
        $http.get('/browser/api/v1/me').success(function (data) {
            s.user = data.user;
            callback();
        }).error(function (data, status) {
            if (status === status.UNAUTHORIZED) {
                s.user = null;
            }
        });
    };
    return s;
};


//# sourceMappingURL=services.js.map