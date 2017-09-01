import './company-item.html';

Template.companyItem.onRendered(function () {
});

Template.companyItem.helpers({
    'owner': function () {
        var id = this.company.ownerId,
            user = Meteor.users.findOne({_id: id});
        //user is an object so better change later second return
        //also later return only needed fields
        if (user) {
            return user;
        }
        return 'no user found'
    }
});