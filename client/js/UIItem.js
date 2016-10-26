"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by py on 02/09/16.
 */

var UIItem = function () {
    function UIItem(type, amount, description, dayCode, labels, isSaved) {
        _classCallCheck(this, UIItem);

        this.type = type;
        this.amount = amount;
        this.description = description;
        this.dayCode = dayCode;
        this.labels = labels;
        this.isSaved = isSaved || false;
    }

    _createClass(UIItem, [{
        key: "setItemFromForm",
        value: function setItemFromForm(form) {
            this.amount = form.html.amount.value;
            this.description = form.html.description.value;
            this.labels.isPlan = form.html.isPlanned;
            this.labels.isDeleted = form.html.isDeleted;
        }
    }], [{
        key: "transformToUIItem",
        value: function transformToUIItem(obj) {
            var item = new UIItem(obj.type, obj.amount, obj.description, obj.dayCode, obj.labels);
            item._id = obj._id;
            item.__v = obj.__v;
            item.campaignId = obj.campaignId;
            item.messageId = obj.messageId;
            item.occuredAt = obj.occuredAt;
            item.sourceId = obj.sourceId;
            item.storedAt = obj.storedAt;
            item.userId = obj.userId;
            item.userToken = obj.userToken;
            return item;
        }
    }]);

    return UIItem;
}();

module.exports = UIItem;

//# sourceMappingURL=UIItem.js.map