import { VZ } from '/imports/startup/both/namespace';
import './skills-card.html';

Template.skillsCard.onCreated(function () {
    this.editState = new ReactiveVar(false);
});

Template.skillsCard.helpers({
    editState: function () {
        var tmpl = Template.instance();
        return tmpl.editState.get();
    },

    editStateCb: function () {
        return Template.instance().editState
    },

    profileOwner: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        if (user) {
            return Meteor.userId() === user._id;
        }
        return false
    },
    
    skills: function () {
        var user = Meteor.users.findOne({_id: Router.current().params.id});
        
        if(user){
            var skills = user.profile.skills;
            
            if (skills && _.isArray(skills) ){
                return skills
            }
        }
        return []
    }
});

Template.skillsCard.events({
    'click .edit-button': function (event, tmpl) {
        tmpl.editState.set(!tmpl.editState.get());
        setTimeout(function () {
            Template.profileCardList.updateMasonry();
        }, 0)
    },

    'submit #addNewSkillForm': function (event, tmpl) {
        event.preventDefault();
        var skill = tmpl.$('#addSkillInput').val();
        if(skill && skill.trim().length > 2){
            Meteor.call('addUserSkill', skill, function (err, res) {
                if(err){
                    console.log(err);
                    VZ.notify('Failed to add skill, try again');
                } else {
                    VZ.notify('Skill added');
                    tmpl.$('#addSkillInput').val('');
                }
            })
        } else {
            VZ.notify('Skill must be at least 3 symbols');
        }
    },
    
    'click .delete-skill': function (e, tmpl) {
        e.preventDefault();
        var skill = this.toString();
        Meteor.call('removeUserSkill', skill, function (err, res) {
            if(err){
                console.log(err);
                VZ.notify('Failed to remove skill');
            } else {
                VZ.notify('Skill removed');
            }
        })
    }
});