/**
 *Created by py on 29/10/2016
 */

'use strict';

function isCmdCPressed(event){
    if(event.key !== undefined) {
        return event.metaKey && (event.key === 'c' || event.key === 'с');
    }
    else {
        return event.metaKey && (event.keyCode === 67);
    }
}
function isCmdVPressed(event){
    if(event.key !== undefined) {
        return event.metaKey && (event.key === 'v' || event.key === 'м');
    }
    else {
        return event.metaKey && (event.keyCode === 86);
    }
}
function handleKeyPress(event, scope){
    // console.log(event.keyCode);
    // console.log(`key presses ${event.key} or ${event.keyCode}`);
    // console.log(`ctrlKey is ${event.ctrlKey}`);
    // console.log(`shiftKey is ${event.shiftKey}`);
    // console.log(`altKey is ${event.altKey}`);
    // console.log(`metaKey is ${event.metaKey}`);

    if(isCmdCPressed(event)){
        scope.$emit('pressed::key::copy', {keyCode: event.keyCode});
    }
    if(isCmdVPressed(event)){
        scope.$emit('pressed::key::paste', {keyCode: event.keyCode});
    }
}

module.exports = handleKeyPress;