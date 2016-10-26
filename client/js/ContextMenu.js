"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by py on 15/09/16.
 */

var guid = require('./guid');

var ContextMenu = function () {
    function ContextMenu(state, target) {
        _classCallCheck(this, ContextMenu);

        this.state = state;
        this.target = target;
        this.setUp().setHTML();
    }

    _createClass(ContextMenu, [{
        key: "setUp",
        value: function setUp() {
            this.options = [{ id: "copy", name: "copy budget from previous month", getUrl: "" }, { id: "clear", name: "clear this month", getUrl: "" }];
            return this;
        }
    }, {
        key: "setHTML",
        value: function setHTML() {
            this.html = {};
            this.html.isShown = false;
            this.html.style = {};
            return this;
        }
    }, {
        key: "setOptionsAsync",
        value: function setOptionsAsync() {
            var cm = this.target;
            var pm = this.state.getPreviousMonthRef(cm);
            var payloadType = this.state.payloadType;
            this.options[0].name = "copy budget from " + pm.html.formattedMonth;
            // this.options[0].getUrl = `api/v1/command/copy/${pm.monthString}/${payloadType}`;
            this.options[0].getUrl = "api/v1/command/copy/" + cm.monthString + "/" + pm.monthString + "/" + payloadType;
            this.options[1].name = "clear " + cm.html.formattedMonth;
            this.options[1].getUrl = "api/v1/command/clear/" + cm.monthString + "/" + undefined + "/" + payloadType;
        }
    }, {
        key: "show",
        value: function show() {
            this.html.isShown = true;
            return this;
        }
    }, {
        key: "hide",
        value: function hide() {
            this.html.isShown = false;
        }
    }]);

    return ContextMenu;
}();

module.exports = ContextMenu;

//# sourceMappingURL=ContextMenu.js.map