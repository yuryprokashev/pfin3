/**
 *Created by py on 29/10/2016
 */

'use strict';
const guid = require('../guid');
const UIItem = require('../UIItem');

function handleMonthDataChange(event, args, scope, http){
    function setMonthDataFromResponse(response) {
        scope.$applyAsync(function(){
            args.month.update(response.data.totals);
        });
    }
    function logError(err) {
        console.log(err);
    }
    http.get(args.month.getUrl).then(setMonthDataFromResponse, logError);
}

module.exports = handleMonthDataChange;