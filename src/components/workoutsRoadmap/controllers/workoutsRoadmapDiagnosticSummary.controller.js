(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticSummaryController',
        function (diagnosticData) {
            'ngInject';

            var vm = this;

            diagnosticData.diagnosticResultProm.then(function (diagnosticResult) {
                vm.compositeScore = diagnosticResult.compositeScore;
                vm.userStats = diagnosticResult.userStats;
            });

            diagnosticData.diagnosticIntroConfigMapProm.then(function (diagnosticIntroConfigMap) {
                vm.diagnosticSubjects = diagnosticIntroConfigMap.subjects;
            });

        });
})(angular);
