(function (angular) {
    'use strict';

    angular.module('demo').config(function(UserGoalsServiceProvider){
        UserGoalsServiceProvider.settings = {
            defaultSubjectScore: 600,
            minSchoolScore: 400,
            maxSchoolScore: 1600,
            minGoalsScore: 200,
            maxGoalsScore: 800,
            updateGoalNum: 10,
            subjects: [
                { name: 'math', svgIcon: 'math-section-icon' },
                { name: 'verbal', svgIcon: 'verbal-icon' }
            ]
        };
    });
})(angular);
