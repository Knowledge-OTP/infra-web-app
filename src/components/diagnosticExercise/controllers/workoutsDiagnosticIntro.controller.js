(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticIntroController',
        function(WORKOUTS_DIAGNOSTIC_FLOW, $log, $state, WorkoutsDiagnosticFlow, znkAnalyticsSrv) {
        'ngInject';
            var vm = this;

            vm.params = WorkoutsDiagnosticFlow.getCurrentState().params;
            vm.diagnosticId = WorkoutsDiagnosticFlow.getDiagnosticSettings().diagnosticId;

            WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
                vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            });

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticIntroController: click on quit, go to roadmap');
                $state.go('app.workouts.roadmap');
            };

            this.goToExercise = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'diagnosticSectionStarted',
                    props: {
                        sectionId: vm.params.sectionId,
                        order: vm.params.order,
                        subjectId: vm.params.subjectId
                    }
                });
                znkAnalyticsSrv.timeTrack({ eventName: 'diagnosticSectionCompleted' });
                $state.go('app.diagnostic.exercise');
            };
    });
})(angular);
