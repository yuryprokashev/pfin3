"use strict";

/**
 *Created by py on 31/10/2016
 */

function helperGetMonthDataAsync(month, http) {
    function setMonthDataFromResponse(response) {
        month.update(response.data.totals);
    }
    function logError(err) {
        console.log(err);
    }
    http.get(month.getUrl).then(setMonthDataFromResponse, logError);
}

module.exports = helperGetMonthDataAsync;

//# sourceMappingURL=helperGetMonthDataAsync.js.map