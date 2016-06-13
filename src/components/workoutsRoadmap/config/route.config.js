(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.workoutsRoadmap', {
                    url: '/workoutsRoadmap',
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: function data(ExerciseStatusEnum, WorkoutsSrv, DiagnosticSrv, $q) {
                            'ngInject';

                            var isDiagnosticCompletedProm = DiagnosticSrv.getDiagnosticStatus();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([
                                isDiagnosticCompletedProm,
                                workoutsProgressProm
                            ]).then(function (res) {
                                var isDiagnosticCompleted = res[0] === ExerciseStatusEnum.COMPLETED.enum;
                                var workoutsProgress = res[1];

                                return {
                                    diagnostic: {
                                        status: isDiagnosticCompleted ? ExerciseStatusEnum.COMPLETED.enum : ExerciseStatusEnum.ACTIVE.enum,
                                        workoutOrder: 0
                                    },
                                    workoutsProgress: workoutsProgress
                                };
                            });
                        }
                    },
                    controller: 'WorkoutsRoadMapController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.diagnostic.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm',
                    resolve: {
                        isDiagnosticStarted: function (DiagnosticSrv, ExerciseStatusEnum) {
                            'ngInject';

                            return DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                                return status === ExerciseStatusEnum.ACTIVE.enum;
                            });
                        }
                    }
                })
                .state('app.workoutsRoadmap.diagnostic.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout', {
                    url: '/workout?workout',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapWorkoutController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html',
                    controller: 'WorkoutsRoadMapWorkoutIntroController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout.inProgress', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html',
                    controller: 'WorkoutsRoadMapWorkoutInProgressController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                });
        }]);
})(angular);
