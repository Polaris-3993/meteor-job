import './create-edit-project-tags.html';

Template.tagsBlock.onCreated(function () {
    this.showTagInput = new ReactiveVar(false);
    this.hideTagInput = function () {
        this.showTagInput.set(false);
    };
});

Template.tagsBlock.helpers({
    showTagInput: function () {
        return Template.instance().showTagInput.get();
    }
});

Template.tagsBlock.events({
    'click .show-tag-input-icon': function (event, tmpl) {
        tmpl.showTagInput.set(true);
    },
    'click .add-tag-icon': function (event, tmpl) {
        var $input = tmpl.$('#tags');
        var tags = tmpl.data.tags;

        tags.push($input.val().trim());
        tmpl.data.onReactiveVarSet(tags);
        tmpl.hideTagInput();
    },
    'click .cancel-add-tag-icon': function (event, tmpl) {
        tmpl.hideTagInput();
    },
    'click .delete-tag-icon': function (event, tmpl) {
        var tagToDelete = this;
        var tags = tmpl.data.tags;
        tags = _.reject(tags, function (tag) {
            return tag == tagToDelete;
        });
        tmpl.data.onReactiveVarSet(tags);
    }
});