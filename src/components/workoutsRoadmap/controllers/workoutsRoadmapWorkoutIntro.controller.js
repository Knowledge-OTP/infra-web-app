'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutIntroController',
        function (data, $state, WorkoutsRoadmapSrv, $q, $scope, ExerciseStatusEnum, ExerciseTypeEnum, SubjectEnum, $timeout) {
            'ngInject';

            var FIRST_WORKOUT_ORDER = 1;

            var vm = this;

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
            var prevWorkout = prevWorkoutOrder >= FIRST_WORKOUT_ORDER ? data.workoutsProgress && data.workoutsProgress[prevWorkoutOrder] : data.diagnostic;

            //set times workouts
            (function () {
                var getPersonalizedWorkoutsByTimeProm;
                var subjectsToIgnore;

                if (prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum) {
                    if (!currWorkout.personalizedTimes) {
                        if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                            subjectsToIgnore = prevWorkout.subjectId;
                        }
                        getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(subjectsToIgnore);
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
                    return exerciseTypeEnumVal ? exerciseTypeEnumVal.toLowerCase() + '-icon' : '';
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
                        var getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(usedSubjects);
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
            /*            var self = this;
             var subjectMap = SubjectEnum.getEnumMap();
             var currWorkout = data.exercise;
             var timeout;
             var translateFilter = $filter('translate');
             var workoutId = currWorkout && +currWorkout.workoutOrder;
             if (isNaN(workoutId)) {
             $state.go('appWorkouts.roadmap', {}, {
             reload: true
             });
             }

             self.workoutIntroData = {};

             self.shareData = {
             twitter: {
             description: translateFilter('WORKOUTS_ROADMAP_WORKOUT_INTRO.SHARE_TEXT')
             }
             };

             self.onSocialPopUpOpen = function (network) {
             SocialSharingService.setSocialSharing(network, true).then(function (special) {
             $log.debug('WorkoutsRoadMapWorkoutIntroController onSocialPopUpOpen set social sharing ' + network + ':', special[network]);
             $state.go('app.workouts.roadmap.workout', {}, {
             reload: true
             });
             });
             };

             function _isPreviousWorkoutCompleted(isDiagnosticCompleted) {
             var workoutOrder = +currWorkout.workoutOrder;

             var FIRST_WORKOUT_ORDER = 1;
             if (workoutOrder === FIRST_WORKOUT_ORDER) {
             return isDiagnosticCompleted;
             }

             var prevWorkout = data.workoutsProgress[workoutOrder - 2];//    workouts order start from 1
             return prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum;
             }

             function _saveCurrentWorkout() {
             WorkoutsService.setWorkout(workoutId, currWorkout);
             }

             function _setSubject(subjectId) {
             if (subjectId === SubjectEnum.MATH.enum) {
             self.workoutIntroData.subjectIcon = 'math-section-icon';
             } else {
             self.workoutIntroData.subjectIcon = subjectMap[subjectId] + '-icon';
             }
             self.workoutIntroData.subjectName = SubjectService.translateSubjectName(subjectId);
             currWorkout.subjectId = subjectId;
             }

             function _setTimeButtons(personalizedWorkoutExercisesByTime) {
             self.workoutIntroData.minutesButtonsArray = [];
             var exercisesTimeArr = [
             ExerciseTimeEnum['2_MIN'].enum,
             ExerciseTimeEnum['5_MIN'].enum,
             ExerciseTimeEnum['10_MIN'].enum
             ];
             var exerciseTypeToSvgIconMap = {};
             exerciseTypeToSvgIconMap[ExerciseTypeEnum.TUTORIAL.enum] = 'tips-and-tricks';
             exerciseTypeToSvgIconMap[ExerciseTypeEnum.PRACTICE.enum] = 'exercise-icon';

             angular.forEach(exercisesTimeArr, function (exerciseTime, index) {
             var exerciseForTime = personalizedWorkoutExercisesByTime[exerciseTime];

             if (angular.isDefined(exerciseForTime && exerciseForTime.subjectId)) {
             _setSubject(exerciseForTime.subjectId);
             }

             var timeItem;
             if (exerciseForTime) {
             timeItem = angular.copy(exerciseForTime);
             timeItem.svgIcon = exerciseTypeToSvgIconMap[exerciseForTime.exerciseTypeId];
             if (angular.isUndefined(self.userTimePreference)) {
             self.userTimePreference = +index;
             }
             }
             self.workoutIntroData.minutesButtonsArray.push(timeItem);
             });
             }

             function _setTimesExercises(subjectToIgnoreForNextDaily) {
             var getPersonalizedWorkoutTimesProm;
             if (!currWorkout.personalizedTimes) {
             if (data.personalizedWorkoutTimesProm) {
             getPersonalizedWorkoutTimesProm = data.personalizedWorkoutTimesProm;
             } else {
             getPersonalizedWorkoutTimesProm = WorkoutPersonalizationService
             .getExercisesByTimeForNewWorkout(subjectToIgnoreForNextDaily);
             }
             } else {
             getPersonalizedWorkoutTimesProm = $q.when(currWorkout.personalizedTimes);
             }
             getPersonalizedWorkoutTimesProm.then(function (personalizedTimes) {
             currWorkout.personalizedTimes = personalizedTimes;
             _setTimeButtons(personalizedTimes);
             _saveCurrentWorkout();
             });
             return getPersonalizedWorkoutTimesProm;
             }

             this.timePreference = {
             short: 0,
             medium: 1,
             long: 2
             };
             this.exerciseTimeEnumArray = ExerciseTimeEnum.getEnumArr();
             this.exerciseStatus = ExerciseStatusEnum;
             angular.extend(this.workoutIntroData, currWorkout);

             var promArr = [
             WorkoutsDiagnosticFlow.getDiagnostic(),
             UserGoalsService.getGoals(),
             EstimatedScoreSrv.getEstimatedScores(),
             EstimatedScoreSrv.getCompositeScore(),
             ContentAvailSrv.getFreeContentDailyNum()
             ];
             $q.all(promArr).then(function (results) {
             self.userGoals = results[1];
             self.estimatedScore = results[2];
             self.estimatedCompositeScore = results[3];
             self.isFreeContentDailyNum = (results[4] + 1) === +currWorkout.workoutOrder;
             self.userScoreGoal = self.userGoals ? (self.userGoals.compositeScore - (self.estimatedCompositeScore.compositeScoreResults || 0)) : 0;

             self.diagnosticCompleted = !!results[0].isComplete;

             if (self.diagnosticCompleted) {
             self.isPreviousCompleted = _isPreviousWorkoutCompleted(self.diagnosticCompleted);

             HintSrv.triggerHint(HintSrv.hintMap.IN_APP_MESSAGE_WORKOUT_INTRO);

             if (self.diagnosticCompleted && self.isPreviousCompleted) {
             var prevWorkout = data.workoutsProgress[currWorkout.workoutOrder - 2];
             var subjectToIgnoreForNextDaily = prevWorkout && prevWorkout.workoutOrder ? prevWorkout.subjectId : undefined;
             _setTimesExercises(subjectToIgnoreForNextDaily);

             var subjectsToIgnore = [];
             var NUM_OF_SUBJECTS = 3;
             self.changeSubject = function () {
             self.rotate = true;

             subjectsToIgnore.push(currWorkout.subjectId);
             if (subjectsToIgnore.length === NUM_OF_SUBJECTS) {
             subjectsToIgnore = [];
             }
             delete currWorkout.personalizedTimes;
             delete data.personalizedWorkoutTimesProm;
             _setTimesExercises(subjectsToIgnore).then(function () {
             timeout = $timeout(function () {
             self.rotate = false;
             }, 450);
             });
             };
             }
             }
             });

             this.clickHandler = function (timePreference) {
             if (angular.isArray(self.workoutIntroData.minutesButtonsArray) && self.workoutIntroData.minutesButtonsArray[timePreference]) {
             this.userTimePreference = timePreference;
             }
             };

             this.startExercise = function () {
             var selectedWorkout = self.workoutIntroData.minutesButtonsArray[self.userTimePreference];
             var isWorkoutGenerated = selectedWorkout && angular.isDefined(selectedWorkout.subjectId)
             && angular.isDefined(selectedWorkout.exerciseTypeId)
             && angular.isDefined(selectedWorkout.exerciseId);
             if (!isWorkoutGenerated) {
             return;
             }
             var propTosCopy = ['subjectId', 'exerciseTypeId', 'exerciseId', 'categoryId'];
             angular.forEach(propTosCopy, function (prop) {
             currWorkout[prop] = selectedWorkout[prop];
             });
             currWorkout.status = ExerciseStatusEnum.ACTIVE.enum;
             delete currWorkout.personalizedTimes;

             znkAnalyticsSrv.eventTrack({
             eventName: 'workoutStarted',
             props: {
             timeBundle: self.userTimePreference,
             workoutOrderId: currWorkout.workoutOrder,
             exerciseType: currWorkout.exerciseTypeId,
             subjectType: currWorkout.subjectId,
             exerciseId: currWorkout.exerciseId
             }
             });

             znkAnalyticsSrv.timeTrack({
             eventName: 'workoutCompleted'
             });

             WorkoutsService.setWorkout(workoutId, currWorkout).then(function () {
             $state.go('app.workouts.workout', {
             workout: workoutId
             });
             });
             };

             this.showPurchaseDialog = function () {
             purchaseService.showPurchaseDialog();
             };

             $scope.$on('$destroy', function () {
             if (angular.isDefined(timeout)) {
             $timeout.cancel(timeout);
             }
             });*/
        }
    );
})();
