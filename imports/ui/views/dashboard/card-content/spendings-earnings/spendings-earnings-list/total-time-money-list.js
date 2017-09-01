import { Tasks } from '/imports/api/tasks/tasks';

Template.totalTimeMoneyList.helpers({
    taskName: function () {
        var taskId = this.taskId;
        var task = Tasks.findOne({_id: taskId});
        var taskKeyName = task && task.taskKey +': ' + task.name;
        return taskKeyName;
    },
    isSpendingsCard: function () {
        var tmpl = Template.instance();
        var title = tmpl.data && tmpl.data.title;
        return title == 'Spendings';
    }
});