(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('workoutsRoadmap', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: function data(ExerciseStatusEnum, WorkoutsSrv, /*WorkoutsDiagnosticFlow,*/ $q) {
                            'ngInject';

                            // var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([workoutsProgressProm, /*isDiagnosticCompletedProm, */]).then(function (res) {
                                var workoutsProgress = res[0];
                                var isDiagnosticCompleted = true;//!!res[1];

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
                .state('workoutsRoadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.diagnostic.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.diagnostic.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.workout', {
                    url: '/workout?workout',
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkout.template.html',
                    controller: 'WorkoutsRoadMapWorkoutController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.workout.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html',
                    controller: 'WorkoutsRoadMapWorkoutIntroController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.workout.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
            /*  .state('app.workouts.roadmap.workout.intro', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutIntro.template.html',
             controller: 'WorkoutsRoadMapWorkoutIntroController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.inProgress', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutInProgress.template.html',
             controller: 'WorkoutsRoadMapWorkoutInProgressController',
             controllerAs: 'vm'
             })

             .state('app.workouts.roadmap.workout.summary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutSummary.template.html',
             controller: 'WorkoutsRoadMapWorkoutSummaryController',
             controllerAs: 'vm'
             })*/;
        }]);
})(angular);
