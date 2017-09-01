import { Tools } from '/imports/api/tools/tools';

import './workplace-card.html';
import './last-edited-footer/workplace-card-last-edited-footer';

Template.workplaceCard.onRendered(function () {
    this.$('.tooltipped').tooltip({delay: 300, position: 'bottom'});
});

Template.workplaceCard.onDestroyed(function () {
    this.$('.tooltipped').tooltip('remove');
});

Template.workplaceCard.events({});

Template.workplaceCard.helpers({
    tools: function () {
        var ids = _.map(this.tools, function (tool) {
            return tool.id;
        });
        var tools = Tools.find({_id: {$in: ids}});
        return tools;
    },

    isOwner: function () {
        return Template.currentData().ownerId === Meteor.userId();
    },

    lastEditedAt: function () {
        return this.editedAt || this.createdAt;
    },

    lastEditedBy: function () {
        return this.editedBy || this.ownerId
    }
});