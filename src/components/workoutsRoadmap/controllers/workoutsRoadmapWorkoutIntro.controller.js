'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutIntroController',
        function (data, $state, WorkoutsRoadmapSrv, $q, $scope, ExerciseStatusEnum, ExerciseTypeEnum, SubjectEnum, $timeout) {
            'ngInject';

            var FIRST_WORKOUT_ORDER = 1;

            var vm = this;

            vm.workoutsProgress = data.workoutsProgress;

            var currWorkout = data.exercise;
            var currWorkoutOrder = currWorkout && +currWorkout.workoutOrder;
            if (isNaN(currWorkoutOrder)) {
                $state.go('appWorkouts.roadmap', {}, {
                    reload: true
                });
            }
            vm.workoutOrder = currWorkoutOrder;

            WorkoutsRoadmapSrv.getWorkoutAvailTimes().then(function (workoutAvailTimes) {
                vm.workoutAvailTimes = workoutAvailTimes;
            });

            function setTimesWorkouts(getPersonalizedWorkoutsByTimeProm) {
                getPersonalizedWorkoutsByTimeProm.then(function (workoutsByTime) {
                    vm.workoutsByTime = workoutsByTime;
                    WorkoutsRoadmapSrv.getWorkoutAvailTimes().then(function (workoutAvailTimes) {
                        for (var i in workoutAvailTimes) {
                            var time = workoutAvailTimes[i];
                            if (workoutsByTime[time]) {
                                vm.selectedTime = time;
                                break;
                            }
                        }
                    });
                });
            }

            var prevWorkoutOrder = currWorkout.workoutOrder - 1;
            var prevWorkout = prevWorkoutOrder >= FIRST_WORKOUT_ORDER ? data.workoutsProgress && data.workoutsProgress[prevWorkoutOrder - 1] : data.diagnostic;

            //set times workouts
            (function () {
                var getPersonalizedWorkoutsByTimeProm;
                var subjectsToIgnore;

                if (prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum) {
                    if (!currWorkout.personalizedTimes) {
                        if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                            subjectsToIgnore = prevWorkout.subjectId;
                        }
                        getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(subjectsToIgnore, currWorkout.workoutOrder);
                    } else {
                        getPersonalizedWorkoutsByTimeProm = $q.when(currWorkout.personalizedTimes);
                    }

                    setTimesWorkouts(getPersonalizedWorkoutsByTimeProm);
                }
            })();


            vm.getWorkoutIcon = function (workoutLength) {
                if (vm.workoutsByTime) {
                    var exerciseTypeId = vm.workoutsByTime[workoutLength] && vm.workoutsByTime[workoutLength].exerciseTypeId;
                    var exerciseTypeEnumVal = ExerciseTypeEnum.getValByEnum(exerciseTypeId);
                    return exerciseTypeEnumVal ? 'workouts-progress-' + exerciseTypeEnumVal.toLowerCase() + '-icon' : '';
                }
                return '';
            };

            vm.changeSubject = (function () {
                var usedSubjects = [];
                var subjectNum = SubjectEnum.getEnumArr().length;

                return function () {
                    usedSubjects.push(currWorkout.subjectId);
                    if (usedSubjects.length === subjectNum) {
                        usedSubjects = [];
                    }

                    delete currWorkout.personalizedTimes;
                    delete vm.selectedTime;

                    $timeout(function(){
                        var getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(usedSubjects, currWorkout.workoutOrder);
                        setTimesWorkouts(getPersonalizedWorkoutsByTimeProm);
                        getPersonalizedWorkoutsByTimeProm.then(function () {
                            vm.rotate = false;
                        }, function () {
                            vm.rotate = false;
                        });
                    });
                };

            })();

            $scope.$watch('vm.selectedTime', function (newSelectedTime) {
                if (angular.isUndefined(newSelectedTime)) {
                    return;
                }

                if (vm.workoutsByTime) {
                    vm.selectedWorkout = vm.workoutsByTime[newSelectedTime];
                    currWorkout.subjectId = vm.selectedWorkout.subjectId;
                }
            });
        }
    );
})();
