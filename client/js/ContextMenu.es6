/**
 * Created by py on 15/09/16.
 */

const guid = require('./guid');

class ContextMenu {

    constructor(state, target) {
        this.state = state;
        this.target = target;
        this.setUp().setHTML();
    }

    setUp() {
        this.options = [
            {id: "copy", name: `copy budget from previous month` , getUrl: "" },
            {id: "clear", name: `clear this month`, getUrl: ""}
        ];
        return this;
    }

    setHTML() {
        this.html = {};
        this.html.isShown = false;
        this.html.style = {};
        return this;
    }

    setOptionsAsync() {
        let cm = this.target;
        let pm = this.state.getPreviousMonthRef(cm);
        let payloadType = this.state.payloadType;
        this.options[0].name = `copy budget from ${pm.html.formattedMonth}`;
        // this.options[0].getUrl = `api/v1/command/copy/${pm.monthString}/${payloadType}`;
        this.options[0].getUrl = `api/v1/command/copy/${cm.monthString}/${pm.monthString}/${payloadType}`;
        this.options[1].name = `clear ${cm.html.formattedMonth}`;
        this.options[1].getUrl = `api/v1/command/clear/${cm.monthString}/${undefined}/${payloadType}`;
    }

    show() {
        this.html.isShown = true;
        return this;
    }

    hide(){
        this.html.isShown = false;
    }

}

module.exports = ContextMenu;