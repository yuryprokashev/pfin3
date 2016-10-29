/**
 * Created by py on 21/10/16.
 */

//@param: Angular element e
//@param: Angular scope s
//@function: attach drag functionality to element
function enableDrag(e, s){

    let handleDragStart = function(event){
        // console.log('dragstart');
        e.addClass("dragged");
        e.removeClass('highlight-on-hover');
        s.$emit('dragged::item::start', {item: s.self});
    };

    let handleDragEnd = function(event){
        e.removeClass("dragged");
    };

    e[0].addEventListener('dragstart', handleDragStart, false);
    e[0].addEventListener('dragend', handleDragEnd, false);
}
module.exports = enableDrag;