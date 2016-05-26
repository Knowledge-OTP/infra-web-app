(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapBasePreSummaryController',
        function ($timeout, WorkoutsSrv, SubjectEnum, data, ExerciseStatusEnum, $filter,
                  WorkoutsRoadmapSrv, purchaseService) {
            'ngInject';

            var DIAGNOSTIC_ORDER = 0;

            var TIMOUT_BEFORE_GOING_TO_NEXT = 1500;

            var translateFilter = $filter('translate');
            var vm = this;

            function _getToNextWorkout() {
                data.roadmapCtrlActions.freezeWorkoutProgressComponent(true);

                var currentWorkout = data.exercise;

                var subjectToIgnoreForNextDaily;
                if (currentWorkout.workoutOrder !== DIAGNOSTIC_ORDER) {
                    subjectToIgnoreForNextDaily = currentWorkout.subjectId;
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
                    WorkoutsRoadmapSrv.generateNewExercise(subjectToIgnoreForNextDaily);

                $timeout(function () {
                    data.roadmapCtrlActions.freezeWorkoutProgressComponent(false);
                    data.roadmapCtrlActions.setCurrWorkout(nextWorkout.workoutOrder);
                }, TIMOUT_BEFORE_GOING_TO_NEXT);
            }

            if (data.exercise.workoutOrder === DIAGNOSTIC_ORDER) {
                diagnosticPreSummary();
            } else {
                workoutPreSummary();
            }

            function diagnosticPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMERY.DIAGNOSTIC_TEST');
                _getToNextWorkout();
            }

            function workoutPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMERY.WORKOUT') + ' ';
                vm.text += +data.exercise.workoutOrder;
                _getToNextWorkout();
            }
        }
    );
})();
