'use strict';

/**
 * Created by py on 22/10/16.
 */

//@param: Angular element e
//@param: Angular scope s
//@function: attach drag functionality to element

function enableDrop(e, s) {
    let dragSourceDay;
    s.self.isDragOver = false;

    var handleDragStart = function handleDragStart(event) {
        s.$apply(function () {
            s.self.isDragOver = true;
            dragSourceDay = s.self;
        });
    };

    var handleDragOver = function handleDragOver(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        s.$apply(function () {
            s.self.isDragOver = true;
        });
        event.dataTransfer.dropEffect = 'move';
    };

    var handleDragEnter = function handleDragEnter() {
        s.$apply(function () {
            s.self.isDragOver = true;
        });
        // console.log('drag over ' + s.self.timeWindow);
    };

    var handleDragLeave = function handleDragLeave(event) {
        s.$apply(function () {
            s.self.isDragOver = false;
        });
    };

    var handleDragEnd = function handleDragEnd(event) {};

    var handleDrop = function handleDrop(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        s.$apply(function () {
            s.self.isDragOver = false;
        });
        s.$emit('dropped::item', { dragSourceDay: dragSourceDay, dropTargetDay: s.self });
    };

    e[0].addEventListener('dragstart', handleDragStart, false);
    // e[0].addEventListener('dragged::item::start', handleDragStart, false);
    e[0].addEventListener('dragover', handleDragOver, false);
    e[0].addEventListener('dragenter', handleDragEnter, false);
    e[0].addEventListener('dragleave', handleDragLeave, false);

    e[0].addEventListener('dragend', handleDragEnd, false);
    e[0].addEventListener('drop', handleDrop, false);
}
module.exports = enableDrop;

//# sourceMappingURL=enableDrop.es6.map