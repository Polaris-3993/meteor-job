import { Tasks } from '/imports/api/tasks/tasks';
import './completed-tasks.html';

Template.completedTasks.helpers({
    completedTaskItems: function () {
        return Tasks.find({status: 'Closed' , $or: [ { membersIds: Meteor.userId() }, { ownerId: Meteor.userId() } ]}).fetch();
    }
});
