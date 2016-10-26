'use strict';

/**
 * Created by py on 15/10/16.
 */

function setCurrencyFromLocale(locale) {
    if (locale === 'en_US') {
        return 'USD';
    } else {
        return 'RUB';
    }
}
module.exports = setCurrencyFromLocale;

//# sourceMappingURL=setCurrencyFromLocale.js.map