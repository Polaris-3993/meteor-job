//client-app-id-handle
import { ClientApps } from './clientApps';

Meteor.methods({
    registerClientApp() {
        return ClientApps.insert({
            lastUpdated: Date.now()
        });
    },
    checkClientAppID(data) {
        var result = ClientApps.find({_id: data._id}).count() > 0;
        if(result === true) {
            ClientApps.update({_id: data._id}, {lastUpdated: Date.now()});
            return result;
        } else {
            ClientApps.remove({_id: data._id});
            // TODO in this case need also remove all authentications
            // with old clientAppId
            return ClientApps.insert({
                lastUpdated: Date.now()
            });
        }
    }
});
