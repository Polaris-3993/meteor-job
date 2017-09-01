import './find-users/find-users';
import './search-user-bar/search-user-bar';
import './add-participant.html';

import { VZ } from '/imports/startup/both/namespace';

Template.addParticipant.onCreated(function () {
    this.newParticipantsIds = new ReactiveArray([]);
    this.findUsersSearchString = new ReactiveVar('');
});

Template.addParticipant.onRendered(function () {
});

Template.addParticipant.onDestroyed(function () {
});

Template.addParticipant.helpers({

    findUsersSearchString: function () {
        return Template.instance().findUsersSearchString.get();
    },

    newAndAlreadyAddedParticipantsIds: function () {
        var newParticipantsIds = Template.instance().newParticipantsIds.list().array();
        return _.union(newParticipantsIds, this.conversation.participantsIds);
    },

    newParticipantsIds: function () {
        return Template.instance().newParticipantsIds.list();
    },

    onAddUserCb: function () {
        var tmpl = Template.instance();
        return function (userId) {
            tmpl.newParticipantsIds.push(userId);
            tmpl.$('.search-user-input').val('');
            tmpl.findUsersSearchString.set('');
        }
    },
    onRemoveUserCb: function () {
        var tmpl = Template.instance();
        return function (userId) {
            tmpl.newParticipantsIds.remove(userId);
        }
    }
});

Template.addParticipant.events({
    'input .search-user-input': _.throttle(function (event, tmpl) {
        setTimeout(function () {
            var $input = tmpl.$('.search-user-input');
            var value = $input.val();

            tmpl.findUsersSearchString.set(value);
        }, 50);
    }, 100),

    'click .cancel': function (event, tmpl) {
        tmpl.data.changeComponent('participantsList');
    },


    'click .save': function (event, tmpl) {
        var newParticipantsIds = tmpl.newParticipantsIds.array();

        // create public conversaion
        if (tmpl.data.conversation.isPrivate) {
            // participant from current conversation
            var participant = _.reject(tmpl.data.conversation.participantsIds,
                function (partId) {
                    return partId == Meteor.userId();
                });
            var participantsIds = _.union(newParticipantsIds, participant);

            Meteor.call('createConversation', null, participantsIds, function (error, res) {
                if (error) {
                    VZ.notify(error.message);
                } else {
                    Meteor.call('openConversationWindow', res, function (error) {
                        if (error) {
                            VZ.notify(error.message);
                        }
                        tmpl.data.changeComponent('messagesRegular');
                    });
                }
            });
        } else {
            Meteor.call('addParticipantsToConversation',
                tmpl.data.conversation._id, newParticipantsIds, function (err) {
                    if (err) {
                        VZ.notify(err.message);
                    } else {
                        tmpl.data.changeComponent('messagesRegular');
                    }
                });
        }
    }
});