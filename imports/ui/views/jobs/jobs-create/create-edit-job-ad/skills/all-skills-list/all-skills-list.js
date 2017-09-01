import { Skills } from '/imports/api/skills/skills';
import './all-skills-list.html';

Template.allSkillsList.onCreated(function () {
    this.searchString = new ReactiveVar('');
});

Template.allSkillsList.onRendered(function () {
    var self = this;

    // hide allSkillsList, if click outside list
    $(document).mouseup(function (event) {
        var container = $('.skills-list');
        if (!container.is(event.target) && container.has(event.target).length === 0) {
            self.data.hideAllSkillsList();
        }
    });
});

Template.allSkillsList.helpers({
    allSkills: function () {
        var selectedCategoryId = this.selectedCategoryId;

        var searchString = Template.instance().searchString.get();
        var regex = new RegExp(searchString, 'gi');

        return Skills.find({
            _id: {$nin: this.selectedSkillsIds},
            relatedJobCategoryId: selectedCategoryId,
            label: {$regex: regex},
            isArchived: false
        }, {
            sort: {label: 1}
        });
    }
});

Template.allSkillsList.events({
    'input #filter-input': _.debounce(function (event, tmpl) {
        tmpl.searchString.set(event.target.value);
    }, 300),

    'click .all-skills': function (event, tmpl) {
        var id = event.target.id;

        tmpl.data.addSkill(id);
    }
});