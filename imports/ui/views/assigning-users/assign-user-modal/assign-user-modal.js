import './user-group-item(is not used now)/user-group-item';
import './assign-user-modal.html';

Template.assignUserModal.onCreated(function () {
    var self = this;
    this.removeTemplate = function () {
        setTimeout(function () {
            Blaze.remove(self.view);
        }, 500);
    };
});

Template.assignUserModal.onRendered(function () {
    this.$('.modal').modal();
    this.$('.modal').modal('open');
    var self = this;
    $('.lean-overlay').on('click', function () {
        self.removeTemplate();
    });
});

Template.assignUserModal.onDestroyed(function () {
    $('.lean-overlay').remove();
});

Template.assignUserModal.helpers({
    isSelectedPosition: function (position) {
        var alreadyAssigned = Template.instance().data.assignedToUserPositions;
        return _.find(alreadyAssigned, function (assignedPosition) {
            return assignedPosition.name == position.name;
        });
    }
});

Template.assignUserModal.events({
    'click .assign-user-button': function (event, tmpl) {
        var selectedPositionName = tmpl.$('.user-position-radio:checked').val();
        var availablePositions = tmpl.data.userPositions;
        var selectedPosition = _.find(availablePositions, function (position) {
            return position.name == selectedPositionName;
        });

        tmpl.data.onAssignUser({_id:tmpl.data.userId, positions: [selectedPosition]});
        tmpl.$('#time-tracker-project-modal-picker').modal('close');
        tmpl.removeTemplate();
    }
});








//Template.assignUserModal.onCreated(function () {
//    this.selectedPositions = new ReactiveArray(this.data.assignedToUserPositions);
//
//    var self = this;
//    this.removeTemplate = function () {
//        setTimeout(function () {
//            Blaze.remove(self.view);
//        }, 500);
//    };
//});
//
//Template.assignUserModal.onRendered(function () {
//    this.$('.modal').modal();
//    this.$('.modal').modal('open');
//    var self = this;
//    $('.lean-overlay').on('click', function () {
//        self.removeTemplate();
//    });
//});
//
//Template.assignUserModal.onDestroyed(function () {
//    $('.lean-overlay').remove();
//});
//
//Template.assignUserModal.helpers({
//    onChangePositionCb: function () {
//        var selectedRolesReactArray = Template.instance().selectedPositions;
//
//        return function (position, shouldBeRemoved) {
//            if (shouldBeRemoved) {
//                selectedRolesReactArray.remove(function (alreadySelectedPosition) {
//                    return alreadySelectedPosition.name == position.name;
//                });
//            } else {
//                selectedRolesReactArray.push(position);
//            }
//        }
//    }
//});
//
//Template.assignUserModal.events({
//    'click .assign-user-button': function (event, tmpl) {
//        var selectedPositions = tmpl.selectedPositions.array();
//
//        tmpl.data.onAssignUser({_id:tmpl.data.userId, positions: selectedPositions});
//        tmpl.$('#time-tracker-project-modal-picker').modal('close');
//        tmpl.removeTemplate();
//    }
//});