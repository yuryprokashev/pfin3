"use strict";

/**
 * Created by py on 21/10/16.
 */

//@param: Angular element e
//@param: Angular scope s
//@function: attach drag functionality to element
function enableDrag(e, s) {

    var handleDragStart = function handleDragStart(event) {
        // console.log('dragstart');
        e.addClass("dragged");
        s.$emit('dragged::item::start', { item: s.self });
    };

    var handleDragEnd = function handleDragEnd(event) {
        e.removeClass("dragged");
    };

    e[0].addEventListener('dragstart', handleDragStart, false);
    e[0].addEventListener('dragend', handleDragEnd, false);
}

module.exports = enableDrag;

//# sourceMappingURL=enableDrag.js.map