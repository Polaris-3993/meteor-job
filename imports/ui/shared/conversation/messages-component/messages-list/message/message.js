import './message.html';

Template.message.onRendered(function () {
    this.$('.avatar').tooltip();
});
Template.message.onDestroyed(function () {
    this.$('.avatar').tooltip('remove');
});

Template.message.helpers({
    isMyMessage: function () {
        return this.message.senderId == Meteor.userId();
    },

    participantsForWhomMessageIsLastReaded: function (messageId) {
        var lastReadBy = [];
        this.lastReadMessages.forEach(function (lastReadMessage) {
            if (lastReadMessage.messageId == messageId) {
                lastReadBy.push(lastReadMessage.readBy);
            }
        });

        return lastReadBy;
    },

    formattedMessage: function () {
        var addHyperLinks = function (string) {
            var formattedString = string;
            var urlRegEx = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?/gi;
            var url;
            while (url = urlRegEx.exec(rawText)) {
                if (url) {
                    var tag = '<a target="_blank" href="' + url[0] + '">' + url[0] + '</a>';
                    formattedString = formattedString.replace(url[0], tag);
                }
            }
            return formattedString;
        };

        var rawText = this.message.text;
        return addHyperLinks(rawText);
    }
});

Template.message.events({
});