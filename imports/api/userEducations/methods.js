Meteor.methods({
    addEducation: function (education) {
        var userId = this.userId;
        if (userId) {
            if(!education.isStudy){
                if (moment(education.startAt).isAfter(moment(education.completeAt))) {
                    throw new Meteor.Error('Start date should be greater than complete date!');
                }
            }
            var id = UserEducation.insert(education);
            Meteor.users.update({
                _id: userId
            }, {
                $addToSet: {
                    'profile.educationIds': id
                }
            }, function (err) {
                if (err) {
                    throw new Meteor.Error('Failed to insert');
                }
            });
        }

    },
    updateEducation: function (id, education) {
        var userId = this.userId;
        if (userId) {
            if(!education.isStudy){
                if (moment(education.startAt).isAfter(moment(education.completeAt))) {
                    throw new Meteor.Error('Start date should be greater than complete date!');
                }
            }
            UserEducation.update({_id: id}, {$set: education}, function (error) {
                if (error) {
                    throw new Meteor.Error(error.message);
                }
            });
        }
    },
    removeEducation: function (id) {
        var userId = this.userId;
        if (userId) {
            UserEducation.remove(id);
            Meteor.users.update({_id: userId}, { $pull: { 'profile.educationIds': id }});
        }
    }
});