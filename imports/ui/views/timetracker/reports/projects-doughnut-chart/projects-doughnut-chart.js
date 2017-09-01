import { VZ } from '/imports/startup/both/namespace';
import { Projects } from '/imports/api/projects/projects';
import { TimeEntries } from '/imports/api/timeEntries/timeEntries';
import './projects-doughnut-chart.html';


Template.projectsDoughnutChart.onCreated(function () {
    var self = this;
    var dateRange = this.data && this.data.dateRange && this.data.dateRange.get() || this.data.get();
    var userId = this.data && this.data.userId && this.data.userId.get() || Meteor.userId();

    this.projects = defineProjects(dateRange, userId);
    this.chartData = new ReactiveArray([]);
});

Template.projectsDoughnutChart.onRendered(function () {
    var self = this;
    setTimeout(function () {
        var dateRange = self.data && self.data.dateRange && self.data.dateRange.get() || self.data.get();
        var userId = self.data && self.data.userId && self.data.userId.get() || Meteor.userId();

        self.projects = defineProjects(dateRange, userId);
        var chartEl = self.$('#projectsChart').get(0).getContext('2d');
    
        var options = {
            responsive: true,
            tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= VZ.formatChartLabel(value) %>'
        };
    
        var initChart = function () {
            self.chartData.clear();
            var dateRange = self.data && self.data.dateRange && self.data.dateRange.get() || self.data.get();
            var userId = self.data && self.data.userId && self.data.userId.get() || Meteor.userId();

            self.projects.forEach(function (project) {
                var label = 'No Project';
                if (project) {
                    label = Projects.findOne({_id: project}).name;
                }
                self.chartData.push({
                    value: calculateProjectTime(project, dateRange, userId),
                    color: VZ.getRandomColor(),
                    label: label
                })
            });
    
            if (self.projectsChart) {
                self.projectsChart.destroy();
            }
            self.projectsChart = new Chart(chartEl).Doughnut(self.chartData.array(), options);
        };
    
        setInterval(function () {
            initChart();
        }, 60 * 1000);
        
        initChart();
    }, 100)
});

Template.projectsDoughnutChart.helpers({
    projects: function () {
        return Template.instance().chartData.list();
    }
});

var calculateProjectTime = function (projectId, dataRange, userId) {
    var range = VZ.dateRanges[dataRange.range],
        startDate = moment(dataRange.date).startOf(range).toDate(),
        endDate = moment(dataRange.date).endOf(range).toDate(),
        sum = 0,
        entries = TimeEntries.find({
            userId: userId,
            projectId: projectId,
            startDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).fetch();

    _.each(entries, function (entry) {
        var diff = moment(entry.endDate).diff(entry.startDate);
        sum += diff;
    });
    if (sum > 0) {
        sum = sum / 1000 / 60 / 60;
    }
    return sum;
};

var defineProjects = function (dataRange, userId) {
    var projects = new Set(),
        range = VZ.dateRanges[dataRange.range],
        startDate = moment(dataRange.date).startOf(range).toDate(),
        endDate = moment(dataRange.date).endOf(range).toDate()

    var entries = TimeEntries.find({
        userId: userId,
        startDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).fetch();
    // console.log(entries);

    _.each(entries, function (entry) {
        if (entry.projectId) {
            var project = Projects.findOne({_id: entry.projectId});
            if (project) {
                projects.add(entry.projectId)
            }
        } else {
            projects.add(undefined)
        }
    });
    // console.log(projects)
    return projects;
};
