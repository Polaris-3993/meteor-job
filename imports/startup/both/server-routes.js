Meteor.startup(function () {
    Router.map(function () {
        this.route('drop-users', {
            where: 'server',
            path: '/drop-users',
            action: function (token) {
                var obj = {};
                Meteor.call('removeAllUsers');
                obj.users = Meteor.users.find().count();
                var data = JSON.stringify(obj);
                this.response.writeHead(200, {'Content-Type': 'application/json'});
                this.response.end(data)
            }
        });
    });
});