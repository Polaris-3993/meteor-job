export const Tasks = new Mongo.Collection('vz-tasks');
import { VZ } from '/imports/startup/both/namespace';

VZ.UserRoles = VZ.UserRoles || {};
VZ.UserRoles.Tasks = {};

VZ.UserRoles.Tasks.userPositions = [{
    name: 'Member',
    roles: ['task-member'],
    propertyNameInCollection: 'membersIds',
    canBeAssignedBy: ['task-owner']
}];

/**
 * //TODO: SHOULD BE on the Client
 * tasksSubs = new SubsManager({
    cacheLimit: 5,
    expireIn: 120
});
 * **/

const simpleSchema = new SimpleSchema({
    name: {
        type: String,
        min: 3,
        max: 50
    },
    taskKey: {
        type: String,
        min: 2,
        max: 15
    },
    description: {
        type: String,
        min: 5,
        max: 5000,
        optional: true
    },
    // startDate: {
    //     type: Date,
    //     optional: true
    //
    // },
    // dueDate: {
    //     type: Date,
    //     optional: true
    //
    // },
    // estimatedDuration: {
    //     type: Number,
    //     min: 1,
    //     optional: true
    //
    // },
    tags: {
        type: [String],
        optional: true
    },
    status: {
        type: String,
        optional: true
    },
    projectId: {
        type: String
    },
    taskFiles: {
        type: [Object],
        optional: true
    },
    'taskFiles.$.fileName': {
        type: String,
        optional: true
    },
    'taskFiles.$.mediaLink': {
        type: String
    },
    'taskFiles.$.size': {
        type: Number,
        optional: true
    },
    'taskFiles.$.uploaded': {
        type: Date
    },
    'taskFiles.$.type': {
        type: String,
        optional: true
    },
    ownerId: {
        type: String
    },
    archived: {
        type: Boolean,
        optional: true
    },
    createdAt: {
        type: Date
    },
    editedAt: {
        type: Date
    },
    editedBy: {
        type: String
    },
    membersIds: {
        type: [String],
        optional: true
    },
    sendToInReview: {
        type: String,
        optional: true
    }
});

if (!Meteor.settings.dontUseSchema) {
    Tasks.attachSchema(simpleSchema);
}
