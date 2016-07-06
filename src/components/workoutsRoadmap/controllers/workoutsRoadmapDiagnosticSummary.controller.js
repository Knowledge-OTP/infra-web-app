(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticSummaryController',
        function (diagnosticData) {
            'ngInject';

            var vm = this;

            vm.diagnosticSubjects = diagnosticData.diagnosticSubjects;

            vm.compositeScore = diagnosticData.compositeScore;

            vm.userStats = diagnosticData.userStats;
        });
})(angular);
