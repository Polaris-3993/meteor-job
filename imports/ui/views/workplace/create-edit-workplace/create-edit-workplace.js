import { VZ } from '/imports/startup/both/namespace';
import { Tools } from '/imports/api/tools/tools';
import { Workplaces } from  '/imports/api/workPlaces/workPlaces';
import './create-edit-workplace.html';

Template.createEditWorkplace.onCreated(function () {
    this.canBeSubmitted = new ReactiveVar(true);
});

Template.createEditWorkplace.onRendered(function () {
});

Template.createEditWorkplace.helpers({
    tools: function () {
        return Tools.find();
    },
    isToolInWorkplace: function (id) {
        return !!Workplaces.findOne({'tools._id': id});
    },

    canBeSubmitted: function () {
        return Template.instance().canBeSubmitted.get();
    }
});

Template.createEditWorkplace.events({
    'submit #createEditWorkplaceForm': function (event, tmpl) {
        var getWorkplaceDocumet = function () {
            var name = tmpl.$('#name').val().trim();
            var description = tmpl.$('#description').val().trim();

            var checkedTools = tmpl.$('.tool-checkbox:checked');
            var tools = _.map(checkedTools, function (checkbox) {
                return {_id: checkbox.value};
            });

            if (name.length <= 0) {
                VZ.notify('Name required');
            }

            if (tools.length < 1) {
                var message = 'Check at least one tool!';
                VZ.notify(message);
                throw new Meteor.Error(message);
            }

            return {
                name: name,
                description: description,
                tools: tools
            };
        };
        event.preventDefault();

        var workplace = getWorkplaceDocumet();

        if (tmpl.data.workplace) {
            workplace._id = tmpl.data.workplace._id;
            workplace.assignedUsersIds = tmpl.data.workplace.assignedUsersIds;

            Meteor.call('editWorkplace', workplace, function (err) {
                if (err) {
                    console.log(err);
                    VZ.notify('Failed to edit workplace');
                }
                else {
                    VZ.notify('Successfully edited!');
                    Router.go('workplaces');
                }
            })
        } else {
            Meteor.call('createWorkplace', workplace, function (err) {
                if (err) {
                    console.log(err);
                    VZ.notify('Failed to create workplace')
                }
                else {
                    VZ.notify('Successfully created!');
                    Router.go('workplaces');
                }
            })
        }
    },

    'reset #createEditWorkplaceForm': function (event, tmpl) {
        Router.go('workplaces');
    },

    'blur input': function (event, tmpl) {
        tmpl.canBeSubmitted.set(tmpl.$('input.invalid').length == 0);
    }
});

