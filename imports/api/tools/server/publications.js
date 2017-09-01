import { Tools } from '../tools';

Meteor.publish('Tools', function () {
    var userId = this.userId;
    if (userId) {
        return Tools.find();
    }
    this.ready();
});