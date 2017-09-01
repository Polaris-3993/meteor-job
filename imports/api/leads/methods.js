import { Skills } from '/imports/api/skills/skills';
import { Leads } from './leads';

Meteor.methods({
    parseUpload: function( data ) {
        for ( var i = 0; i < data.length; i++ ) {
            var item   = data[ i ];
            Skills.insert( item );
        }
    },
    getLeads: function () {
        return Leads.find({},{reactive: false}).fetch();
    }
});