import './menu-item.html';
Template.leftMenuItem.onCreated(function () {
    var self = this;
    this.currentPath = new ReactiveVar(Iron.Location.get().path);

    this.autorun(function () {
        var path = Iron.Location.get().path;
        self.currentPath.set(path);
    })
});

Template.leftMenuItem.onRendered(function () {
});

Template.leftMenuItem.helpers({
    isActive: function () {
        if (Template.instance().data.iconMenu) {
            return Template.instance().data.data.link === Template.instance().currentPath.get();
        }
        else {
            return this.link === Template.instance().currentPath.get();
        }
    },
    iconMenu: function () {
        return !!Template.instance().data.iconMenu;
    }
});