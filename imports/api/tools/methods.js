Meteor.methods({
    'renderHtmlPage': function (url) {
        var phantom = Meteor.npmRequire('phantomjs');
        console.log(phantom);
    }
});