/**
 *Created by py on 22/12/2016
 */

'use strict';
const guid = require('../guid.es6');
const UIItem = require('../UIItem.es6');

function handlePayloadTypeChange(event, args, scope, http){
    scope.state.payloadType = args.type;
}

module.exports = handlePayloadTypeChange;