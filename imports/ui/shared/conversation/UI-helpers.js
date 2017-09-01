UI.registerHelper('conversationTitle', function (conversation) {
    if (conversation.isPrivate) {
        var user = Meteor.users.findOne({
            _id: {
                $in: this.conversation.participantsIds,
                $ne: Meteor.userId()
            }
        });
        return user ? user.profile.fullName : null;
    } else {
        if (conversation.title) {
            return conversation.title;
        } else {
            var allParticipantsIds = conversation.participantsIds.slice(0);

            allParticipantsIds.push(conversation.ownerId);

            var otherParticipantsIds = _.reject(allParticipantsIds, function (partId) {
                return partId == Meteor.userId();
            });

            var otherParticipants = Meteor.users.find({_id: {$in: otherParticipantsIds}});

            var firstNames = _.map(otherParticipants.fetch(), function (participant) {
                return participant.profile.firstName;
            });

            return firstNames.join(', ');
        }
    }
});