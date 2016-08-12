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
            updatedDays:[],
            updatedMonths:[],
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
        var allowedKeys = ["currentMonth", "currentWeek", "currentDay", "currentItem", "updatedMonths", "isUpdated", "http", "user"];
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

    // param: String arrayKey - the variable name of Array, we want to update
    // param: Object valueToAdd - the value, we are going to push into Array with name 'key'
    // function: pushes value to Array 'key'
    // return: Shared object, so method can be chained.
    var push = function(arrayKey, valueToAdd) {
        var isInArray = function(element, index, array){
            return element === valueToAdd;
        };
        if(!singleton.state[arrayKey].some(isInArray)){
            singleton.state[arrayKey].push(valueToAdd);
        }
        return singleton;
    };

    // param: String key - the variable name of Array in state, where we want to pop last element
    // function: removes given element
    // return: void
    var remove = function (arrayKey, valueToRemove) {
        var isInArray = function(element, index, array){
            return element === valueToRemove;
        };
        var indexToRemove = singleton.state[arrayKey].findIndex(isInArray);
        singleton.state[arrayKey].splice(indexToRemove,1);
    };

    // param: String arrayKey - the array in state, where we want to check the key
    // param: Object valueToCheck - the value that we want to check (is it in given array in state)
    // function: checks if given valueToCheck is in Shared.state[arrayKey].
    // return: Bool status
    var check = function(arrayKey, valueToCheck) {
        var result;
        var isInArray;
        if(valueToCheck.length === 8){
            isInArray = function(element, index, array) {
                return element === valueToCheck;
            };
            result = singleton.state[arrayKey].some(isInArray) ? true : false;
        }
        else if(valueToCheck.length === 6){
            var monthArray = [];
            var transformToMonthString = function (element, index, array) {
                monthArray.push(element.slice(0,6));
            };
            singleton.state[arrayKey].forEach(transformToMonthString);
            isInArray = function(element, index, array) {
                return element === valueToCheck;
            };
            result = monthArray.some(isInArray) ? true : false;
        }
        return result;

    };

    var clear = function(arrayKey) {
        singleton.state[arrayKey] = [];
    };

    // initialize singleton internally, so it exists every time, I call require('../common/Shared)
    init();

    return {
        getInstance: get,
        change: change,
        log: log,
        push: push,
        remove: remove,
        check: check,
        clear: clear
    }

})();

module.exports = Shared;