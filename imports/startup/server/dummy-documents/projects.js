import { Projects } from '/imports/api/projects/projects';
import { VZ } from '/imports/startup/both/namespace';

var projects = [
    {
        name: 'Gen 3 combat uniform',
        createdAt: new Date(),
        description: 'Project',
        tags: ['Crye precision', 'Combat', 'Uniform', 'Multicam'],
        projectKey: 'G3CU',
        archived: false
    },
    {
        name: 'Advanced combat helmet',
        createdAt: new Date(),
        description: 'Project',
        projectKey: 'ACH',
        archived: false
    },
    {
        name: 'Comtac III',
        createdAt: new Date(),
        description: 'Project',
        tags: ['Peltor', 'Comtac', 'Active headset'],
        projectKey: 'C',
        archived: false
    },
    {
        name: 'Adaptive Vest Systems',
        createdAt: new Date(),
        description: 'Project',
        tags: ['Platecarrier', 'Crye precision', 'AVS'],
        projectKey: 'AVS',
        archived: false
    },
    {
        _id: 'K5gNgToq5RxD7Grk7',
        name: 'AR-15',
        createdAt: new Date(),
        description: 'Project',
        tags: ['Armalite', 'Assault rifle', 'Gas operated'],
        projectKey: 'AR',

        archived: false
    }
];

VZ.Server.DummyDocuments.Projects = {
    targetCollection: Projects,
    adminPosition: {
        roles: 'project-admin',
        targetPropertyName: 'ownerId'
    },
    usersPositions: [
        {
            roles: ['project-worker', 'project-manager'],
            targetPropertyName: 'assignedUsersIds'
        },
        {
            roles: 'project-worker',
            targetPropertyName: 'assignedUsersIds'
        }
    ],
    entities: projects
};