/**
 * Created by yukinohito on 3/25/17.
 */
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './all/projects-list-projects-tab';
import './archived/projects-list-archives-tab';
import './project-item-chart';
import './project-item-more';
import './project-item-new';

import './projects-list-new.html';


Template.projectsListNew.onCreated(function() {
  this.currentTab = new ReactiveVar('projectsListProjectsTab');
});

Template.projectsListNew.helpers({
  tab() {
    return Template.instance().currentTab.get();
  },
  accent(tab) {
    if(tab === Template.instance().currentTab.get()) {
      return 'tab-accent-white';
    }
  },
  active(tab) {
    if(tab === Template.instance().currentTab.get()) {
      return 'active';
    }
  }
});

Template.projectsListNew.events({
  'click .tab': function(event, template) {
    let a = event.target;
    if(a.innerText === 'PROJECTS') {
      template.currentTab.set('projectsListProjectsTab');
    } else if(a.innerText === 'ARCHIVED') {
      template.currentTab.set('projectsListArchivesTab');
    }
  }
});
