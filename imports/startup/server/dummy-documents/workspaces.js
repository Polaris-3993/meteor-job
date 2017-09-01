import { Workplaces } from '/imports/api/workPlaces/workPlaces';
import { VZ } from '/imports/startup/both/namespace';

var workplaces = [
    {
        name: 'Falludjah Iraq',
        description: 'Battle of Iraq city Fallujah between US marines and iraqi insurgents',
        createdAt: new Date('7 November, 2004')
    },
    {
        name: 'Korangal Valley Afghanistan',
        description: 'Battles in Korangal valley between US Army and Taliban',
        createdAt: new Date('April 14, 2010')
    },
    {
        name: 'Saigon Vietnam',
        description: 'Battle of Saigon between US Army and VC',
        createdAt: new Date('January 30, 1968')
    }
];

VZ.Server.DummyDocuments.Workplaces = {
    targetCollection: Workplaces,
    adminPosition: {
        roles: 'workplace-admin',
        targetPropertyName: 'ownerId'
    },
    usersPositions: [
        {
            roles: ['workplace-worker', 'workplace-manager'],
            targetPropertyName: 'assignedUsersIds'
        },
        {
            roles: 'workplace-worker',
            targetPropertyName: 'assignedUsersIds'
        }
    ],
    entities: workplaces
};