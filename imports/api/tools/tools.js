export const Tools = new Mongo.Collection('vz-tools');
Meteor.startup(function () {

    var tools = [
        // {
        //     name: 'Testing tool',
        //     template: 'layoutManagerTestTool'
        // },
        // {
        //     name: 'Mini Browser',
        //     template: 'miniBrowserTool'
        // }
    ];

    _.each(tools, function (tool) {
        if (!Tools.findOne(tool)) {
            Tools.insert(tool);
        }
    });

});




Tool = new SimpleSchema({
    name: {
        type: String
    },

    template: {
        type: String
    },

    subscriptions:{
        type: [String],
        optional: true
    }
});

Tools.attachSchema(Tool);