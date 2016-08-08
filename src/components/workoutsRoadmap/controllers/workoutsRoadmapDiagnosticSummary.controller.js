(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticSummaryController',
        function (diagnosticData) {
            'ngInject';

            var vm = this;
            var diagnosticSubjects;

            diagnosticData.diagnosticIntroConfigMapProm.then(function (diagnosticIntroConfigMap) {
                diagnosticSubjects = vm.diagnosticSubjects = diagnosticIntroConfigMap.subjects;
                return diagnosticData.diagnosticResultProm;
            }).then(function (diagnosticResult) {
                var diagnosticScoresObj = diagnosticResult.userStats;
                vm.isSubjectsWaitToBeEvaluated = false;

                for (var i=0, ii = diagnosticSubjects.length; i < ii; i++) {
                    var subjectId = diagnosticSubjects[i].id;

                    if (!diagnosticScoresObj[subjectId]) {
                        vm.isSubjectsWaitToBeEvaluated = true;
                        break;
                    }
                }

                vm.compositeScore = diagnosticResult.compositeScore;
                vm.userStats = diagnosticScoresObj;
            });

        });
})(angular);
