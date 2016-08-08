/**
 * Created by py on 23/07/16.
 */

var Shared;

var MyDates = require('../common/MyDates');

// param: void
// function: Shared module constructor. Module returns Singleton state object,
// which is used to share data between all instances, nested in views.
// return: Shared module
Shared = (function() {

    var singleton;

    // param: HttpResponse res - http response, or any other object with some keys;
    // param: Object obj - object, that we set from response
    // function: sets all values from obj[keys] to values from res with the same keys
    // return: modified obj.
    var setValues = function(res, obj) {
        var data;
        if(res.data) {
            data = res.data;

        }
        else if(!res.data) {
            data = res;
        }

        var keys = Object.keys(data);
        // console.log(keys);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(!obj[key]) {
                throw new Error('Key, you are trying to set, does not exists in obj. Check you response.data and compare it with object.');
            }
            else {
                obj[key] = data[key];
            }
        }

        return obj;
    };

    // param: HttpService http - reference to Angular $http service. Ignored, if singleton already exists.
    // param: MyDates md - reference to MyDates service. Ignored, if singleton already exists.
    // param: String tw - string representation of 'all' timewindow. Ignored, if singleton already exists.
    // param: int sid - subview id, index of subview currently visible on MainView.
    // Starts with 1. Ignored, if singleton already exists.
    // function: return instance, if it exists. If not, create new singleton instance and return it.
    // return: singleton object with shared values and functions
    var init = function() {
        singleton = {service: undefined, fns: undefined, state: undefined};
        singleton.service = {
            http: {},
            MyDates: MyDates
        };
        singleton.fns = {
            setValues: setValues
        };
        singleton.state = {
            currentMonth: MyDates.dateToString(new Date(), {y:1, m:1, d: undefined}),
            currentWeek: MyDates.numberOfWeek(new Date()),
            currentDay: MyDates.dateToString(new Date()),
            currentItem: undefined,
            isUpdated: false
        };


        // singleton.state = {
        //     currentMonth: "201502",
        //     currentWeek: 0,
        //     currentDay: "20150201"
        // };
        singleton.user = {};
        return singleton;
    };

    // param: void
    // function: returns singleton instance
    // return: singleton
    var get = function() {
        if(singleton) {
            return singleton;
        }
        else {
            init();
        }
    };

    // param: String key - the name of attribute you want to change
    // param: Object value - the value of parameter, you want to change
    // function: changes the internal parameter of Shared service to new value
    // return: Shared object, so method can be chained.
    var change = function(key, value) {
        var allowedKeys = ["currentMonth", "currentWeek", "currentDay", "currentItem", "isUpdated", "http", "user"];
        var isAllowedKey = function(element, index, array) {
            return element === key;
        };
        if(!allowedKeys.some(isAllowedKey)) {
            throw new Error('Wrong key string. Allowed keys are: ' + allowedKeys.toString());
        }
        else if(key === "http"){
            singleton.service.http = value;
        }
        else if(key === 'user'){
            singleton[key] = value;
        }
        else {
            singleton.state[key] = value;
        }
        return singleton;
    };

    var log = function(){
        console.log(singleton);
    };

    // initialize singleton internally, so it exists every time, I call require('../common/Shared)
    init();

    return {
        getInstance: get,
        change: change,
        log: log
    }

})();

module.exports = Shared;