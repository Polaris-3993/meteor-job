import { Companies } from '/imports/api/companies/companies';
import { VZ } from '/imports/startup/both/namespace';

var companies = [
    {
        name: 'Crye Precision',
        createdAt: new Date('2001'),
        isPrivate: false,
        description: 'Public company',
        location: {
            country: 'USA',
            city: 'New York',
            address: 'Brooklyn, 63 Flushing Ave Unit 252',
            zip: '11205'
        },
        vat: '593735752',
        registrationNumber: '5748332231'
    },
    {
        name: 'Armalite',
        createdAt: new Date('1954'),
        isPrivate: false,
        description: 'Public company',
        location: {
            country: 'USA',
            city: 'Geneseo, Illinois',
            address: 'P.O. Box 299',
            zip: '61254'
        },
        vat: '34673974',
        registrationNumber: '23483782'
    },
    {
        name: '3M Peltor',
        createdAt: new Date('1902'),
        isPrivate: true,
        description: 'Private company',
        location: {
            country: 'USA',
            city: 'TwVZ.Server = {};o Harbors, Minnesota',
            address: 'Two Harbors',
            zip: '34253'
        },
        vat: '2389764',
        registrationNumber: '1255637'
    }
];

VZ.Server.DummyDocuments =  {};

VZ.Server.DummyDocuments.Companies = {
    targetCollection: Companies,
    adminPosition: {
        roles: 'company-admin',
        targetPropertyName: 'ownerId'
    },
    usersPositions: [
        {
            roles: ['company-manager', 'company-worker'],
            targetPropertyName: 'workersIds'
        },
        {
            roles: 'company-worker',
            targetPropertyName: 'workersIds'
        }
    ],
    entities: companies
};