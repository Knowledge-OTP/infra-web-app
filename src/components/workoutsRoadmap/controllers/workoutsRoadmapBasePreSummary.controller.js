(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapBasePreSummaryController',
        function ($timeout, WorkoutsSrv, SubjectEnum, data, ExerciseStatusEnum, $filter,
                  WorkoutsRoadmapSrv, purchaseService, CategoryService) {
            'ngInject';

            var DIAGNOSTIC_ORDER = 0;

            var TIMOUT_BEFORE_GOING_TO_NEXT = 1500;

            var translateFilter = $filter('translate');
            var vm = this;

            function _getToNextWorkout() {
                data.roadmapCtrlActions.freezeWorkoutProgressComponent(true);

                var currentWorkout = data.exercise;
                var currentWorkoutCategoryId = currentWorkout.categoryId || currentWorkout.categoryId2;
                var currentWorkoutSubjectId = CategoryService.getCategoryLevel1ParentByIdSync(currentWorkoutCategoryId);

                var subjectToIgnoreForNextDaily;
                if (currentWorkout.workoutOrder !== DIAGNOSTIC_ORDER) {
                    subjectToIgnoreForNextDaily = currentWorkoutSubjectId;
                    currentWorkout.status = ExerciseStatusEnum.COMPLETED.enum;
                    WorkoutsSrv.setWorkout(currentWorkout.workoutOrder, currentWorkout);
                }

                var nextWorkoutOrder = currentWorkout.workoutOrder + 1;
                var nextWorkout = data.workoutsProgress[nextWorkoutOrder - 1];
                nextWorkout.status = ExerciseStatusEnum.ACTIVE.enum;

                if (!nextWorkout.isAvail) {
                    purchaseService.openPurchaseNudge(1, currentWorkout.workoutOrder);
                }

                data.personalizedWorkoutTimesProm =
                    WorkoutsRoadmapSrv.generateNewExercise(subjectToIgnoreForNextDaily, nextWorkout.workoutOrder);

                $timeout(function () {
                    data.roadmapCtrlActions.freezeWorkoutProgressComponent(false);
                    data.roadmapCtrlActions.setCurrWorkout(nextWorkout.workoutOrder);
                }, TIMOUT_BEFORE_GOING_TO_NEXT);
            }

            function diagnosticPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMARY.DIAGNOSTIC_TEST');
                _getToNextWorkout();
            }

            function workoutPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMARY.WORKOUT') + ' ';
                vm.text += +data.exercise.workoutOrder;
                _getToNextWorkout();
            }

            if (data.exercise.workoutOrder === DIAGNOSTIC_ORDER) {
                diagnosticPreSummary();
            } else {
                workoutPreSummary();
            }
        }
    );
})();
