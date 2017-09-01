export const Teams = new Mongo.Collection('vz-teams');
import { VZ } from '/imports/startup/both/namespace';

VZ.UserRoles = VZ.UserRoles || {};
VZ.UserRoles.Teams = {};

VZ.UserRoles.Teams.userPositions = [{
    name: 'Manager',
    roles: ['team-member', 'team-manager'],
    propertyNameInCollection: 'membersIds',
    canBeAssignedBy: ['team-admin']
}, {
    name: 'Member',
    roles: ['team-member'],
    propertyNameInCollection: 'membersIds',
    canBeAssignedBy: ['team-admin', 'team-manager']
}];

const schema = new SimpleSchema({
    name: {
        type: String,
        min: 5,
        max: 50
    },
    description: {
        type: String,
        optional: true
    },
    ownerId: {
        type: String
    },
    membersIds: {
        type: [String],
        optional: true
    },
    isPrivate: {
        type: Boolean
    },
    archived: {
        type: Boolean,
        optional: true
    },
    assignedProjectId: {
        type: String,
        optional: true
    },

    assignedCompanyId: {
        type: String,
        optional: true
    }
});


if (!Meteor.settings.dontUseSchema) {
    Teams.attachSchema(schema);
}