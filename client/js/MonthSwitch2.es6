/**
 *Created by py on 27/12/2016
 */

'use strict';

const Month = require('./Month.es6');
const MyDates = require('./MyDates.es6');

class MonthSwitch {
    constructor(state) {
        let startMonth, endMonth;
        let _this = this;

        this.state = state;
        this.cache = new Map();

        const init = () => {
            _this.months = [];
            let months = MyDates.headingsArray(MyDates.neighbours(_this.state.init.month, [-2, 2], ''));

            for(let m of months) {
                let month = new Month(m, state);
                _this.cache.set(m, month);
                _this.months.unshift(month);

                if(months.indexOf(m) === 2) {
                    _this.state.monthRef = month;
                }
            }

        };

        const initHTML = () => {
            _this.html.currency = _this.state.user.public.settings.defaults.currency.toLowerCase();
            _this.html.window = [0,5];
        };

        const isRenewSwitch = () => {
            let result = false;
            let last = _this.months.length - 1;
            if(_this.monthRef.monthString === _this.months[0].monthString || _this.monthRef.monthString === _this.months[last].monthString) {
                result = true;
            }
            return result;
        };

        startMonth = '';
        endMonth = '';


        this.getUrl = `browser/api/v1/payload/monthData/${startMonth}/${endMonth}`;
        this.html = {};
    }

    update() {

    }
}

module.exports = MonthSwitch;