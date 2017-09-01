import './added-user/added-user';
import './found-user-item/found-user-item';
import './find-users.html';

Template.findUser.onCreated(function () {
    // dynamic subscription on users
    var self = this;
    self.autorun(function () {
        // subscribe on assignedUsers
        var participantsIds = Template.currentData().participantsIds;
        self.subscribe('assignedUsers', participantsIds);
    });
    self.autorun(function () {
        // subscribe by typed search string
        var searchString = Template.currentData().findUsersSearchString;
        self.subscribe('usersByNameOrEmailRegExp', searchString, 10);
    });
});

Template.findUser.helpers({
    foundUsers: function () {
        var tmpl = Template.instance();

        var searchParams = {};

        var searchString = tmpl.data.findUsersSearchString;
        if (searchString != '') {
            searchString = searchString.replace(/[\(\)\[\\]/g, '');
            var searchStringRegExp = new RegExp(searchString, 'gi');
            searchParams.$or = [
                {'profile.fullName': {$regex: searchStringRegExp}},
                {'emails.address': {$regex: searchStringRegExp}}
            ];
        }

        var addedUsersIds = tmpl.data.participantsIds;
        // conversation owner shouldn't be in a list
        addedUsersIds.push(tmpl.data.conversation.ownerId);

        searchParams._id = {$nin: addedUsersIds};

        return Meteor.users.find(searchParams, {limit: 10});
    }
});

Template.findUser.events({
    'change input': function (event, tmpl) {
        if (event.target.checked) {
            tmpl.data.onAddUser(this._id);
        }
    }
});
