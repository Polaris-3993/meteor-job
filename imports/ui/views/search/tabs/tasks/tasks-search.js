import { Tasks } from '/imports/api/tasks/tasks';
import './tasks-search.html';

Template.tasksSearch.helpers({
    tasks: function () {
        return Tasks.find().fetch();
    }
});