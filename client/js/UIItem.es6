/**
 * Created by py on 02/09/16.
 */

class UIItem {
    constructor(type, amount, description, dayCode, labels, isSaved) {
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.dayCode = dayCode;
        this.labels = labels;
        this.isSaved = isSaved || false;
        this.isCopied = false;
    }

    setItemFromForm(form){
        this.amount = form.html.amount.value;
        this.description = form.html.description.value;
        this.labels.isPlan = form.html.isPlanned;
        this.labels.isDeleted = form.html.isDeleted;
    }

    static transformToUIItem (obj){
        let item = new UIItem(obj.type, obj.amount, obj.description, obj.dayCode, obj.labels);
        item._id = obj._id;
        item.__v = obj.__v;
        item.campaignId = obj.campaignId;
        item.messageId = obj.messageId;
        item.occurredAt = obj.occurredAt;
        item.sourceId = obj.sourceId;
        item.storedAt = obj.storedAt;
        item.userId = obj.userId;
        item.userToken = obj.userToken;
        return item;
    }

    static copy(item){
        return new UIItem(
            item.type,
            item.amount,
            item.description,
            item.dayCode,
            item.labels,
            item.isSaved
        )
    }

}


module.exports = UIItem;