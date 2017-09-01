import { Teams } from '/imports/api/teams/teams';
import { VZ } from '/imports/startup/both/namespace';

var teams = [
    {
        name: 'Navy SEALs Team Six',
        description: 'Public team',
        isPrivate: false
    },
    {
        name: '75 Rangers Regiment',
        description: 'Public team',
        isPrivate: false
    },
    {
        name: '22 SAS regiment',
        description: 'Private team',
        isPrivate: true
    },
    {
        name: 'MARSOC',
        description: 'Public team',
        isPrivate: false
    },
    {
        name: '160th Special Operations Aviation Regiment',
        description: 'Private team',
        isPrivate: true
    }
];

VZ.Server.DummyDocuments.Teams = {
    targetCollection: Teams,
    adminPosition: {
        roles: 'team-admin',
        targetPropertyName: 'ownerId'
    },
    usersPositions: [
        {
            roles: ['team-manager', 'team-member'],
            targetPropertyName: 'membersIds'
        },
        {
            roles: 'team-member',
            targetPropertyName: 'membersIds'
        }
    ],
    entities: teams
};