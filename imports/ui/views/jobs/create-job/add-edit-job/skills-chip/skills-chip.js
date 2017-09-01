import './skills-chip.html';

Template.skillsChip.onRendered(function () {
    var self = this;
    $('.chips-placeholder').material_chip({
        placeholder: ' ',
        secondaryPlaceholder: 'Add a skill here',
        data: self.data.skills || []
    });
    this.autorun(function () {
        Template.currentData();
    });
});