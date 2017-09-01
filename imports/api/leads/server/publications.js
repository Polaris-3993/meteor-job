import { Leads } from '../leads';

Meteor.publish('all-leads', function () {
    return Leads.find();
});

