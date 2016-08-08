var ViewCache;

var MyDates = require('../common/MyDates');

ViewCache = (function() {
    // level arrays store subviews arrays
    var l0 = [], l1 = [], l2 = [], l3 = [];
    // 'cache' - is collection of 4 level arrays.
    // four levels depth:
    // cache[0] - view all years,
    // cache[1] - view all months in given year,
    // cache[2] - view all days in given month,
    // cache[3] - view all messages on given day
    var cache = [l0, l1, l2, l3];
    // tracks indexes of the objects inside the level arrays.
    // stores pairs like "2016": 0, "201601": 2
    var viewsIndex = {};

    var reset = function() {
        if(viewsIndex) {
            viewsIndex = undefined;
        }
        else if(cache) {
            cache = undefined;
        }
        cache = [[], [], [], []];
        // tracks indexes of the objects inside the level arrays.
        // stores pairs like "2016": 0, "201601": 2
        viewsIndex = {};
    };

    // param: String t
    // function: parse t and decide, on which level of cache it is stored
    // return: int level

    var timeWindowToLevel = function(t) {
        var ts = MyDates.stringToTw(t);
        // returns index of level, where the subviews array is stored
        if(!ts.year) {
            return 0;
        }
        else if(!ts.month) {
            return 1;
        }
        else if(!ts.day) {
            return 2;
        }
        else {
            return 3
        }
    };

    // param: String t - string representation of TimeWindow
    // function: find the index, where the subviews array is stored in cache[level]
    // return: int index
    var timeWindowToIndex = function(t) {
        // returns the index of subviews array inside the level array
        return viewsIndex[t];
    };

    // param: String t - string representation of TimeWindow
    // function: save the subviews array to cache and store the reference to it in viewsIndex.
    // return: void

    var put = function(t, subviewsArray) {
        if(!t || typeof t !== 'string') {
            throw new Error('timewindow is either undefined, or not String (String expected)');
        }
        else if(!subviewsArray || !Array.isArray(subviewsArray)) {
            throw  new Error('subviews array is either undefined, or not Array (Array expected')
        }
        else {
            var index = timeWindowToIndex(t);
            var level = timeWindowToLevel(t);
            // console.log(index);
            if(index === undefined) {
                // There is no subviews array yet for this timeWindow
                // -> put array in cache and keep track of it's index in level
                if(cache[level].length < Math.pow(2, level)) {
                    cache[level].push(subviewsArray);

                }
                else {
                    cache[level].splice(0, 1);
                    cache[level].push(subviewsArray);
                }
                viewsIndex[t] = cache[level].indexOf(subviewsArray);
            }
            else {
                // There is already subviews array for this timeWindow
                // -> replace old with new one
                cache[level][index] = subviewsArray;
            }
        }
    };

    // param: String t - string representaion of TimeWindow
    // function: get the subviews array for given timewindow
    // return: Array [Object]

    var extract = function(t) {
        if(!t || typeof t !== 'string') {
            throw new Error('timewindow is either undefined, or not String (String expected)');
        }
        else {
            var level = timeWindowToLevel(t);
            var index = timeWindowToIndex(t);
            if(index === undefined) {
                return null;
            }
            else {
                return cache[level][index];
            }
        }
    };

    var log = function(){
        console.log({cache: cache, viewsIndex: viewsIndex});
    };

    var state = function(){
        return {cache: cache, viewsIndex: viewsIndex};
    };

    return {
        put: put,
        extract: extract,
        reset: reset,
        log: log,
        state: state
    }

})();

module.exports = ViewCache;