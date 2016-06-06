(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.workoutsRoadmap', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: function data(ExerciseStatusEnum, WorkoutsSrv, /*WorkoutsDiagnosticFlow,*/ $q) {
                            'ngInject';

                            // var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([workoutsProgressProm, /*isDiagnosticCompletedProm, */]).then(function (res) {
                                var workoutsProgress = res[0];
                                var isDiagnosticCompleted = !!res[1];

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
                    controllerAs: 'vm'
                })
            /*  .state('app.workouts.roadmap.diagnostic.preSummary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapBasePreSummary.template.html',
             controller: 'WorkoutsRoadMapBasePreSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.diagnostic.summary', {
             resolve: {
             diagnosticData: function (WorkoutsDiagnosticFlow) {
             'ngInject';
             return WorkoutsDiagnosticFlow.getDiagnostic().then(function (result) {
             return {
             userStats: result.userStats,
             compositeScore: result.compositeScore
             };
             });
             }
             },
             templateUrl: 'app/workouts/templates/workoutsRoadmapDiagnosticSummary.template.html',
             controller: 'WorkoutsRoadMapDiagnosticSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout', {
             url: '/workout?workout',
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkout.template.html',
             controller: 'WorkoutsRoadMapWorkoutController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.intro', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutIntro.template.html',
             controller: 'WorkoutsRoadMapWorkoutIntroController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.inProgress', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutInProgress.template.html',
             controller: 'WorkoutsRoadMapWorkoutInProgressController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.preSummary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapBasePreSummary.template.html',
             controller: 'WorkoutsRoadMapBasePreSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.summary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutSummary.template.html',
             controller: 'WorkoutsRoadMapWorkoutSummaryController',
             controllerAs: 'vm'
             })*/;
        }]);
})(angular);
