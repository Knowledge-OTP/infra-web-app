(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapController',
        function (data, $state, $scope, ExerciseStatusEnum, $location) {
            'ngInject';

            var vm = this;

            vm.workoutsProgress = data.workoutsProgress;
            vm.diagnostic = data.diagnostic;

            var search = $location.search();
            var DIAGNOSTIC_STATE = 'app.workouts.roadmap.diagnostic';
            var WORKOUT_STATE = 'app.workouts.roadmap.workout';
            var DIAGNOSTIC_PATH = '/workoutsRoadmap/diagnostic';
            var WORKOUT_PATH = '/workoutsRoadmap/workout';
            var isInit;

            function shouldReplaceLocation() {
                if (!isInit) {
                    isInit = true;
                    $location.replace();
                }
            }

            function getActiveWorkout() {
                var i = 0;
                for (; i < vm.workoutsProgress.length; i++) {
                    if (vm.workoutsProgress[i].status !== ExerciseStatusEnum.COMPLETED.enum) {
                        return vm.workoutsProgress[i];
                    }
                }
                return vm.workoutsProgress[i - 1];
            }

            function _isFirstWorkoutStarted() {
                var firstWorkout = vm.workoutsProgress[0];
                return angular.isDefined(firstWorkout.subjectId);
            }

            //set selected item
            switch ($state.current.name) {
                case DIAGNOSTIC_STATE:
                    vm.selectedItem = vm.diagnostic;
                    break;
                case WORKOUT_STATE:
                    var workoutOrder = +search.workout;
                    if (isNaN(workoutOrder) || workoutOrder < 0 || workoutOrder > vm.workoutsProgress.length) {
                        vm.selectedItem = getActiveWorkout();
                    } else {
                        vm.selectedItem = vm.workoutsProgress[workoutOrder - 1];
                    }
                    break;
                default:
                    if (_isFirstWorkoutStarted()) {
                        vm.selectedItem = getActiveWorkout();
                    } else {
                        vm.selectedItem = vm.diagnostic;
                    }
            }
            data.exercise = vm.selectedItem;
            data.roadmapCtrlActions = {};
            data.roadmapCtrlActions.setCurrWorkout = function (_workoutOrder) {
                if (angular.isUndefined(_workoutOrder) || _workoutOrder === null || isNaN(_workoutOrder)) {
                    vm.selectedItem = vm.diagnostic;
                } else {
                    vm.selectedItem = vm.workoutsProgress[_workoutOrder - 1];
                }
            };
            data.roadmapCtrlActions.freezeWorkoutProgressComponent = function (freeze) {
                vm.freezeWorkoutProgressComponent = freeze;
            };

            var LEFT_ANIMATION = 'left-animation';
            var RIGHT_ANIMATION = 'right-animation';
            $scope.$watch('vm.selectedItem', function (newItem, oldItem) {
                if (angular.isUndefined(newItem)) {
                    return;
                }
                if (newItem !== oldItem) {
                    if (newItem.workoutOrder > oldItem.workoutOrder) {
                        vm.workoutSwitchAnimation = LEFT_ANIMATION;
                    } else {
                        vm.workoutSwitchAnimation = RIGHT_ANIMATION;
                    }
                }

                data.exercise = newItem;

                var currentStateName = $state.current.name;
                if (newItem.workoutOrder === 0) {
                    if (currentStateName !== DIAGNOSTIC_STATE) {
                        $location.path(DIAGNOSTIC_PATH);
                        shouldReplaceLocation();
                    }
                } else {
                    search = $location.search();
                    // the current state can be "app.workouts.roadmap.workout.intro"
                    // while the direct link is "app.workouts.roadmap.workout?workout=20"  so no need to navigate...
                    if (currentStateName.indexOf(WORKOUT_STATE) === -1 || +search.workout !== +newItem.workoutOrder) {
                        $location.path(WORKOUT_PATH).search('workout', newItem.workoutOrder);
                        shouldReplaceLocation();
                    }
                }
            });
        }
    );
})();
