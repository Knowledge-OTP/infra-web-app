(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').controller('WorkoutsDiagnosticIntroController',
        function($stateParams, WORKOUTS_DIAGNOSTIC_FLOW, $log, $state, WorkoutsDiagnosticFlow, znkAnalyticsSrv) {
        'ngInject';
            var vm = this;

            this.params = $stateParams;
            this.diagnosticId = WORKOUTS_DIAGNOSTIC_FLOW.diagnosticId;

            WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
                vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            });

            this.onClickedQuit = () => {
                $log.debug('WorkoutsDiagnosticIntroController: click on quit, go to roadmap');
                $state.go('app.workouts.roadmap');
            };

            this.goToExercise = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'diagnosticSectionStarted',
                    props: {
                        sectionId: vm.params.id,
                        order: vm.params.order,
                        subjectId: vm.params.subjectId
                    }
                });
                znkAnalyticsSrv.timeTrack({ eventName: 'diagnosticSectionCompleted' });
                $state.go('app.workouts.diagnostic.exercise', { id: vm.diagnosticId, sectionId: vm.params.id });
            };
    });
})(angular);
