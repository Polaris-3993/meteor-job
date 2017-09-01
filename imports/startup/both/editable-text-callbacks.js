EditableText.registerCallbacks({
    triggerAutoResize : function (doc) {
        $('textarea#editable-text-area').trigger('autoresize');
    },

    updateTaskTime: function (newlyInsertedDocument) {
        var taskId = newlyInsertedDocument && newlyInsertedDocument._id;
        if(taskId){
            Meteor.call('updateTask', taskId, function (error, result) {
                if(error){
                    console.log(error.message);
                }
            });
        }
    },
    updateProjectTime: function (newlyInsertedDocument) {
        var projectId = newlyInsertedDocument && newlyInsertedDocument._id;
        Meteor.call('updateProjectTime', projectId, function (error, result) {
            if(error){
                console.log(error.message);
            }
        });

    }
});