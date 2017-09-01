if (Meteor.isClient){
    Session.set({
        'projectsFormChanged': true,
        'tasksFormChanged': true,
        'teamsFormChanged': true,
        'jobsFormChanged': true,
        'companiesFormChanged': true,
        'contractsFormChanged': true,
        'user-role': 'user',
        'companyId': ''
    });
}
