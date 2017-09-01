export const Workplaces = new Mongo.Collection('vz-workplaces');
import { VZ } from '/imports/startup/both/namespace';

VZ.UserRoles = VZ.UserRoles || {};
VZ.UserRoles.Workplaces = {};

VZ.UserRoles.Workplaces.userPositions = [{
    name: 'Manager',
    roles: ['workplace-worker', 'workplace-manager'],
    propertyNameInCollection: 'assignedUsersIds',
    canBeAssignedBy: ['workplace-admin']
}, {
    name: 'Worker',
    roles: ['workplace-worker'],
    propertyNameInCollection: 'assignedUsersIds',
    canBeAssignedBy: ['workplace-admin', 'workplace-manager']
}];

const Workplace = new SimpleSchema({
    name: {
        type: String
    },

    description: {
        type: String,
        max: 250
    },

    ownerId: {
        type: String
    },

    createdAt: {
        type: Date
    },

    tools: {
        type: [Object],
        optional: true
    },
    'tools.$._id': {
        type: String
    },

    assignedUsersIds: {
        type: [String],
        optional: true
    },

    associatedCompanyId: {
        type: String,
        optional: true
    },

    editedAt: {
        type: Date,
        optional: true
    },
    editedBy: {
        type: String,
        optional: true
    },

    state: {
        type: Object,
        blackbox: true,
        optional: true
    }
});

if (!Meteor.settings.dontUseSchema) {
    Workplaces.attachSchema(Workplace);
}
