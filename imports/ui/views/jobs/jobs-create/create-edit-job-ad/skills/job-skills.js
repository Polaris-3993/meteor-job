import { Skills } from '/imports/api/skills/skills';
import './job-skills.html';

Template.jobSkills.onCreated(function () {
    this.shouldShowAllSkillsList = new ReactiveVar(false);
});

Template.jobSkills.helpers({
    addSkillCb: function () {
        return this.addSkill;
    },

    hideAllSkillsListCb: function () {
        var tmpl = Template.instance();

        return function () {
            tmpl.shouldShowAllSkillsList.set(false);
        }
    },

    canAddMoreSkills: function () {
        return this.selectedSkillsIds.length < 6;
    },

    shouldShowAllSkillsList: function () {
        return Template.instance().shouldShowAllSkillsList.get();
    },

    selectedSkills: function () {
        return Skills.find({_id: {$in: this.selectedSkillsIds}})
    }
});

Template.jobSkills.events({
    'click .add-icon, click .hide-icon': function (event, tmpl) {
        var curr = tmpl.shouldShowAllSkillsList.get();
        tmpl.shouldShowAllSkillsList.set(!curr);
    },

    'click .remove-icon': function (event, tmpl) {
        var skillId = event.target.id;
        tmpl.data.removeSkill(skillId);
    }
});