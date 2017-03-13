(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.workouts', {
                    template: '<ui-view></ui-view>',
                    abstract: true
                })
                .state('app.workouts.roadmap', {
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
                .state('app.workouts.roadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic.intro', {
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
                .state('app.workouts.roadmap.diagnostic.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout', {
                    url: '/workout?workout',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapWorkoutController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html',
                    controller: 'WorkoutsRoadMapWorkoutIntroController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout.inProgress', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html',
                    controller: 'WorkoutsRoadMapWorkoutInProgressController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic.summary', {
                    resolve: {
                        diagnosticData: function (DiagnosticSrv, DiagnosticIntroSrv) {
                            'ngInject';
                            return {
                                diagnosticResultProm: DiagnosticSrv.getDiagnosticExamResult(),
                                diagnosticIntroConfigMapProm: DiagnosticIntroSrv.getConfigMap()
                            };
                        }
                    },
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticSummary.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticSummaryController',
                    controllerAs: 'vm'
                });
        }]);
})(angular);
