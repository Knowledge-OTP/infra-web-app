'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutIntroController',
        function (data, $state, WorkoutsRoadmapSrv, $q, $scope, ExerciseStatusEnum, ExerciseTypeEnum, SubjectEnum, $timeout, WorkoutsSrv) {
            'ngInject';

            var FIRST_WORKOUT_ORDER = 1;
            var MIN_ORDER_TO_VERIFY_SUBJECT = 6;
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

            function setWorkoutAvailTimes(workoutsByTime) {
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
            }

            var prevWorkoutOrder = currWorkout.workoutOrder - 1;
            var prevWorkout = prevWorkoutOrder >= FIRST_WORKOUT_ORDER ? data.workoutsProgress && data.workoutsProgress[prevWorkoutOrder - 1] : data.diagnostic;

            // set times workouts
            function setWorkoutsTimes() {
                var subjectsToIgnore = [];
                if (prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum) {
                    subjectsToIgnore = _getSubjectToIgnore();
                    var getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(subjectsToIgnore, currWorkout.workoutOrder);
                    getPersonalizedWorkoutsByTimeProm.then(function (workoutsByTime) {
                        setWorkoutAvailTimes(workoutsByTime);
                    }, function () {
                    });
                }
            }

            function _getSubjectToIgnore() {
                var subjectsToIgnore = [];
                var lastSubjectToIgnoreHash = {};
                if (currWorkout.workoutOrder >= MIN_ORDER_TO_VERIFY_SUBJECT) {
                    // get last X number of workouts
                    var lastNumberOfWorkoutsArray = data.workoutsProgress.slice(currWorkout.workoutOrder - MIN_ORDER_TO_VERIFY_SUBJECT, prevWorkoutOrder);
                    var subjectEnumArrayLength = SubjectEnum.getEnumArr().length;
                    var subjectEnumMap = SubjectEnum.getEnumMap();
                    // populate hash table of unique subjectIds
                    lastNumberOfWorkoutsArray.forEach(function (item) {
                        lastSubjectToIgnoreHash[item.subjectId] = item.subjectId;
                    });
                    //if all last X subjects were used, get only the prev subjectId
                    if (Object.keys(lastSubjectToIgnoreHash).length === subjectEnumArrayLength) {
                        if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                            subjectsToIgnore.push(prevWorkout.subjectId);
                        }
                    }
                    else {
                        // get subjects to ignore from subjectsHash
                        subjectsToIgnore = Object.keys(subjectEnumMap).filter(function (subjectEnumKey) {
                            return lastSubjectToIgnoreHash[subjectEnumKey] !== undefined;
                        });
                    }
                }
                else if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                    subjectsToIgnore.push(prevWorkout.subjectId);
                }
                return subjectsToIgnore;
            }

            setWorkoutsTimes();

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

                    delete vm.selectedTime;

                    $timeout(function () {
                        var getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(usedSubjects, currWorkout.workoutOrder, true);
                        getPersonalizedWorkoutsByTimeProm.then(function (workoutsByTime) {
                            setWorkoutAvailTimes(workoutsByTime);
                            vm.rotate = false;
                        }, function () {
                            vm.rotate = false;
                        });
                    });
                };

            })();

            vm.startExercise = function () {
                var selectedWorkout = angular.copy(vm.selectedWorkout);
                var isWorkoutGenerated = selectedWorkout &&
                    angular.isDefined(selectedWorkout.subjectId) &&
                    angular.isDefined(selectedWorkout.exerciseTypeId) &&
                    angular.isDefined(selectedWorkout.exerciseId);
                if (!isWorkoutGenerated) {
                    return;
                }
                var propTosCopy = ['subjectId', 'exerciseTypeId', 'exerciseId', 'categoryId'];
                angular.forEach(propTosCopy, function (prop) {
                    currWorkout[prop] = selectedWorkout[prop];
                });
                currWorkout.status = ExerciseStatusEnum.ACTIVE.enum;
                delete currWorkout.$$hashKey;
                delete currWorkout.isAvail;

                // znkAnalyticsSrv.eventTrack({
                //     eventName: 'workoutStarted',
                //     props: {
                //         timeBundle: self.userTimePreference,
                //         workoutOrderId: currWorkout.workoutOrder,
                //         exerciseType: currWorkout.exerciseTypeId,
                //         subjectType: currWorkout.subjectId,
                //         exerciseId: currWorkout.exerciseId
                //     }
                // });
                //
                // znkAnalyticsSrv.timeTrack({
                //     eventName: 'workoutCompleted'
                // });

                WorkoutsSrv.setWorkout(currWorkout.workoutOrder, currWorkout).then(function () {
                    $state.go('app.workouts.workout', {
                        workout: currWorkout.workoutOrder
                    });
                });
            };

            vm.selectTime = function (workoutTime) {
                if (!vm.workoutsByTime[workoutTime]) {
                    return;
                }

                vm.selectedTime = workoutTime;
            };

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
