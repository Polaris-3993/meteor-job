import './add-participant/add-participant';
import './messages-component/messages-component';
import './participants-list/participants-list';
import './search-filter/search-filter';
import './settings/conversation-settings';
import './shared/shared';
import './conversation.html';
import './UI-helpers';

Template.conversation.onCreated(function () {
    this.activeComponent = new ReactiveVar('messagesRegular');

    this.convWrapperPropsOnStart = new ReactiveVar(null);

    this.messageToScrollId = new ReactiveVar(null);
});

Template.conversation.onRendered(function () {
    this.$chatBox = this.$('.chat-box');
    this.$body = $('body');

    this.popUpConversationWindow = function () {
        var $otherWindows = $('.chat-box');
        $otherWindows.css('z-index', 1000);

        this.$chatBox.css('z-index', 1001);
    };
    this.popUpConversationWindow();
});

Template.conversation.onDestroyed(function () {
});

Template.conversation.helpers({
    activeComponent: function () {
        return Template.instance().activeComponent.get();
    },

    changeComponentCb: function () {
        var tmpl = Template.instance();
        return function (activeComponent) {
            tmpl.activeComponent.set(activeComponent);
            tmpl.messageToScrollId.set(null);
        }
    },

    scrollToMessageCb: function () {
        var tmpl = Template.instance();
        return function (messageId) {
            tmpl.activeComponent.set('messagesRegular');
            tmpl.messageToScrollId.set(messageId);
        }
    },

    messageToScrollId: function () {
        return Template.instance().messageToScrollId.get();
    },

    isWindowMoving: function () {
        return Template.instance().convWrapperPropsOnStart.get();
    }
});

Template.conversation.events({
    'click .close-conversation-window-icon': function (event, tmpl) {
        Meteor.call('closeConversationWindow', tmpl.data.conversation._id);
    },
    'click .expand-conversation-icon': function (event, tmpl) {
        Router.go('conversation', {id: tmpl.data.conversation._id});
    },

    'mousedown .chat-box': function (event, tmpl) {
        tmpl.popUpConversationWindow();
    },

    'mousedown .chat-head': function (event, tmpl) {
        var mouseXOnStart = event.clientX;
        var mouseYOnStart = event.clientY;

        var $chatBox = tmpl.$chatBox;
        var windowLeftPosition = parseInt($chatBox.position().left);
        var windowTopPosition = parseInt($chatBox.position().top);

        var differenceX = mouseXOnStart - windowLeftPosition;
        var differenceY = mouseYOnStart - windowTopPosition;

        tmpl.convWrapperPropsOnStart.set({
            diffBetweenMouseAndLeftTop: {
                horizontal: differenceX,
                vertical: differenceY
            },
            conversationWrapperSize: {
                height: $chatBox.height(),
                width: $chatBox.width()
            }
        });

        tmpl.$body.addClass('non-selectable');
    },

    'mouseup .conversation-overlay, mouseup .chat-box': function (event, tmpl) {
        tmpl.convWrapperPropsOnStart.set(null);
        tmpl.$body.removeClass('non-selectable');
    },

    'mousemove': function (event, tmpl) {
        var convWrapperPropsOnStart = tmpl.convWrapperPropsOnStart.get();
        if (convWrapperPropsOnStart) {
            var checkPositionRelativeToBorders = function (positionLeft, positionTop) {
                // compute bottom and right positions
                var positionRight = positionLeft + convWrapperPropsOnStart
                        .conversationWrapperSize.width;
                var positionBottom = positionTop + convWrapperPropsOnStart
                        .conversationWrapperSize.height;

                var scrollTop = tmpl.$body.scrollTop();
                // check whether new position doesn't go beyond borders
                positionLeft = positionLeft >= 0 ? positionLeft : 0;
                positionTop = positionTop >= 55 + scrollTop ? positionTop : 55 + scrollTop;

                positionLeft = positionRight <= window.innerWidth ? positionLeft
                    : window.innerWidth - convWrapperPropsOnStart
                    .conversationWrapperSize.width;

                positionTop = positionBottom <= window.innerHeight + scrollTop ? positionTop
                    : window.innerHeight + scrollTop - convWrapperPropsOnStart
                    .conversationWrapperSize.height;

                return {
                    left: positionLeft,
                    top: positionTop
                }
            };
            var computeNewPosition = function () {
                var mouseX = event.clientX;
                var mouseY = event.clientY + tmpl.$body.scrollTop();

                // compute new left ant top position
                var positionLeft = mouseX -
                    convWrapperPropsOnStart.diffBetweenMouseAndLeftTop.horizontal;
                var positionTop = mouseY -
                    convWrapperPropsOnStart.diffBetweenMouseAndLeftTop.vertical;

                return checkPositionRelativeToBorders(positionLeft,
                    positionTop);
            };

            var newPosition = computeNewPosition();

            tmpl.$chatBox.offset(newPosition);
        }
    }

});