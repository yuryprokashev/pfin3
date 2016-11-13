/**
 *Created by py on 31/10/2016
 */

'use strict';

function helperStopCommandProcessing(scope) {
    scope.state.isCommandProcessing = false;
}

module.exports = helperStopCommandProcessing;