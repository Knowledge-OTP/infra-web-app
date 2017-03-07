/**
 * usage instructions:
 *      1) workout progress:
 *          - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{
 *                  background: red;
 *              }
 *          - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
 *                   border-color: red;
 *              }
 *
 *      2) WorkoutsRoadmapSrv:
 *          setNewWorkoutGeneratorGetter: provide a function which return a new workout generator function. subjectsToIgnore
 *              will be passed as parameter.
 *              i.e:
 *                  function(WorkoutPersonalization){
 *                      'ngInject';
 *
 *                      return function(subjectToIgnore){
 *                          return WorkoutPersonalizationService.getExercisesByTimeForNewWorkout(subjectToIgnoreForNextDaily);
 *                      }
 *                  }
 *              the return value should be a map of exercise time to exercise meta data i.e:
 *              {
 *                 "5" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 150,
 *                   "exerciseTypeId" : 1,
 *                   "subjectId" : 0
 *                 },
 *                 "10" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 109,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 },
 *                 "15" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 221,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 }
 *               }
 *
 *
 *      3) workoutsRoadmap.diagnostic.summary
 *          this state must set i.e
 *              $stateProvider.state('app.workouts.roadmap.diagnostic.summary', {
 *                   template: '<div>Diagnostic </div>',
 *                   controller: 'WorkoutsRoadMapBaseSummaryController',
 *                   controllerAs: 'vm'
 *               })
 *      4) workoutsRoadmap.workout.inProgress
 *          this state must set i.e
 *              $stateProvider.state('app.workouts.roadmap.workout.inProgress', {
 *                  template: '<div>Workout in progress</div>',
 *                  controller: function(){}
 *             })
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra.scroll',
        'znk.infra.general',
        'znk.infra.contentGetters',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.socialSharing',
        'znk.infra.znkExercise',
        'znk.infra.estimatedScore',
        'znk.infra.scoring',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.estimatedScoreWidget'
    ]);
})(angular);

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
                        data: ["ExerciseStatusEnum", "WorkoutsSrv", "DiagnosticSrv", "$q", function data(ExerciseStatusEnum, WorkoutsSrv, DiagnosticSrv, $q) {
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
                        }]
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
                        isDiagnosticStarted: ["DiagnosticSrv", "ExerciseStatusEnum", function (DiagnosticSrv, ExerciseStatusEnum) {
                            'ngInject';

                            return DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                                return status === ExerciseStatusEnum.ACTIVE.enum;
                            });
                        }]
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
                        diagnosticData: ["DiagnosticSrv", "DiagnosticIntroSrv", function (DiagnosticSrv, DiagnosticIntroSrv) {
                            'ngInject';
                            return {
                                diagnosticResultProm: DiagnosticSrv.getDiagnosticExamResult(),
                                diagnosticIntroConfigMapProm: DiagnosticIntroSrv.getConfigMap()
                            };
                        }]
                    },
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticSummary.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticSummaryController',
                    controllerAs: 'vm'
                });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';
            
            var svgMap = {
                'workouts-roadmap-checkmark': 'components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg',
                'workouts-roadmap-change-subject': 'components/workoutsRoadmap/svg/change-subject-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapController',
        ["data", "$state", "$scope", "ExerciseStatusEnum", "$location", function (data, $state, $scope, ExerciseStatusEnum, $location) {
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
        }]
    );
})();

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapBasePreSummaryController',
        ["$timeout", "WorkoutsSrv", "SubjectEnum", "data", "ExerciseStatusEnum", "$filter", "WorkoutsRoadmapSrv", "purchaseService", function ($timeout, WorkoutsSrv, SubjectEnum, data, ExerciseStatusEnum, $filter,
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
        }]
    );
})();

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        ["$state", "ExerciseStatusEnum", "data", "$timeout", function ($state, ExerciseStatusEnum, data, $timeout) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        }]);
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        ["isDiagnosticStarted", "DiagnosticSrv", function (isDiagnosticStarted, DiagnosticSrv) {
            'ngInject';

            var vm = this;

            vm.forceSkipIntro = DiagnosticSrv.forceSkipIntro ? DiagnosticSrv.forceSkipIntro : false;

            vm.buttonTitle = isDiagnosticStarted ? '.CONTINUE_TEST' : '.START_TEST' ;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticSummaryController',
        ["diagnosticData", "ENV", function (diagnosticData, ENV) {
            'ngInject';

            var vm = this;
            var diagnosticSubjects;
            vm.ignoreCompositeScore = ENV.ignoreCompositeScore;
            diagnosticData.diagnosticIntroConfigMapProm.then(function (diagnosticIntroConfigMap) {
                diagnosticSubjects = vm.diagnosticSubjects = diagnosticIntroConfigMap.subjects;
                return diagnosticData.diagnosticResultProm;
            }).then(function (diagnosticResult) {
                var diagnosticScoresObj = diagnosticResult.userStats;
                vm.isSubjectsWaitToBeEvaluated = false;

                for (var i = 0, ii = diagnosticSubjects.length; i < ii; i++) {
                    var subjectId = diagnosticSubjects[i].id;

                    if (!diagnosticScoresObj[subjectId]) {
                        vm.isSubjectsWaitToBeEvaluated = true;
                        break;
                    }
                }

                vm.compositeScore = diagnosticResult.compositeScore;
                vm.userStats = diagnosticScoresObj;
            });

        }]);
})(angular);

'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutController',
        ["$state", "data", "ExerciseStatusEnum", "ExerciseResultSrv", function ($state, data, ExerciseStatusEnum, ExerciseResultSrv) {
            'ngInject';

            function _setExerciseResultOnDataObject() {
                return ExerciseResultSrv.getExerciseResult(data.exercise.exerciseTypeId, data.exercise.exerciseId).then(function (exerciseResult) {
                    data.exerciseResult = exerciseResult;
                    return exerciseResult;
                });
            }

            function _goToState(stateName) {
                var EXPECTED_CURR_STATE = 'app.workouts.roadmap.workout';
                if ($state.current.name === EXPECTED_CURR_STATE) {
                    $state.go(stateName);
                }
            }

            switch (data.exercise.status) {
                case ExerciseStatusEnum.ACTIVE.enum:
                    if (angular.isUndefined(data.exercise.exerciseId) || angular.isUndefined(data.exercise.exerciseTypeId)) {
                        _goToState('.intro');
                    } else {
                        _setExerciseResultOnDataObject().then(function (result) {
                            if (result.isComplete) {
                                _goToState('.preSummary');
                            } else {
                                _goToState('.inProgress');
                            }
                        });
                    }
                    break;
                case ExerciseStatusEnum.COMPLETED.enum:
                    _setExerciseResultOnDataObject().then(function () {
                        _goToState('.summary');
                    });
                    break;
                default:
                    _goToState('.intro');
            }
        }]
    );
})();

(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutInProgressController',
        ["data", "ExerciseResultSrv", function (data, ExerciseResultSrv) {
            'ngInject';

            var vm = this;

            vm.workout = data.exercise;

            ExerciseResultSrv.getExerciseResult(vm.workout.exerciseTypeId, vm.workout.exerciseId, null, null, true).then(function(exerciseResult){
                vm.exerciseResult = exerciseResult;
                exerciseResult.totalQuestionNum = exerciseResult.totalQuestionNum || 0;
                exerciseResult.totalAnsweredNum = exerciseResult.totalAnsweredNum || 0;
            });
        }]
    );
})(angular);

'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutIntroController',
        ["data", "$state", "WorkoutsRoadmapSrv", "$q", "$scope", "ExerciseStatusEnum", "ExerciseTypeEnum", "SubjectEnum", "$timeout", "WorkoutsSrv", function (data, $state, WorkoutsRoadmapSrv, $q, $scope, ExerciseStatusEnum, ExerciseTypeEnum, SubjectEnum, $timeout, WorkoutsSrv) {
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

            function setTimesWorkouts(workoutsByTime) {
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

            //set times workouts
            function setWorkoutsTimes() {
                var getPersonalizedWorkoutsByTimeProm;
                var subjectsToIgnore;

                if (prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum) {
                    if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                        subjectsToIgnore = prevWorkout.subjectId;
                    }
                    getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(subjectsToIgnore, currWorkout.workoutOrder);
                    getPersonalizedWorkoutsByTimeProm.then(function (workoutsByTime) {
                        setTimesWorkouts(workoutsByTime);
                    }, function () {
                    });
                }
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
                            setTimesWorkouts(workoutsByTime);
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
        }]
    );
})();

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'workouts-intro-lock-dotted-arrow': 'components/workoutsRoadmap/svg/dotted-arrow.svg',
                'workouts-intro-lock-lock': 'components/workoutsRoadmap/svg/lock-icon.svg',
                'workouts-intro-lock-share-arrow': 'components/workoutsRoadmap/svg/share-arrow-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }])
        .directive('workoutIntroLock',
            ["DiagnosticSrv", "ExerciseStatusEnum", "$stateParams", "$q", "SocialSharingSrv", "purchaseService", function (DiagnosticSrv, ExerciseStatusEnum, $stateParams, $q, SocialSharingSrv, purchaseService) {
                'ngInject';

                return {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html',
                    restrict: 'E',
                    transclude: true,
                    scope: {
                        workoutsProgressGetter: '&workoutsProgress'
                    },
                    link: function (scope, element) {
                        var currWorkoutOrder = +$stateParams.workout;
                        var workoutsProgress = scope.workoutsProgressGetter();
                        var currWorkout = workoutsProgress[currWorkoutOrder - 1];

                        scope.vm = {};

                        var LOCK_STATES = {
                            NO_LOCK: -1,
                            DIAGNOSTIC_NOT_COMPLETED: 1,
                            PREV_NOT_COMPLETED: 2,
                            NO_PRO_SOCIAL_SHARING: 3,
                            BUY_PRO: 4
                        };

                        var setLockStateFlowControlProm = DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                            if (status !== ExerciseStatusEnum.COMPLETED.enum) {
                                scope.vm.lockState = LOCK_STATES.DIAGNOSTIC_NOT_COMPLETED;
                                element.addClass('lock');
                                return $q.reject(null);
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            var FIRST_WORKOUT_ORDER = 1;
                            if (currWorkoutOrder > FIRST_WORKOUT_ORDER) {
                                var prevWorkoutIndex = currWorkoutOrder - 2;
                                var prevWorkout = workoutsProgress[prevWorkoutIndex];
                                if (prevWorkout.status !== ExerciseStatusEnum.COMPLETED.enum) {
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.PREV_NOT_COMPLETED;
                                    return $q.reject(null);
                                }
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            if(!currWorkout.isAvail){
                                return SocialSharingSrv.getSocialSharingData().then(function(socialSharingData){
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.NO_PRO_SOCIAL_SHARING;

                                    angular.forEach(socialSharingData,function(wasShared){
                                        if(wasShared){
                                            scope.vm.lockState = LOCK_STATES.BUY_PRO;
                                        }
                                    });

                                    return $q.reject(null);
                                });
                            }
                        });

                        setLockStateFlowControlProm.then(function(){
                            scope.vm.lockState = LOCK_STATES.NO_LOCK;
                        });

                        scope.vm.openPurchaseModal = function () {
                            purchaseService.showPurchaseDialog();
                        };
                    }
                };
            }]
        );
})(angular);


(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                    'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/workout-roadmap-check-mark-icon.svg',
                    'workouts-progress-tutorial-icon': 'components/workoutsRoadmap/svg/tutorial-icon.svg',
                    'workouts-progress-practice-icon': 'components/workoutsRoadmap/svg/practice-icon.svg',
                    'workouts-progress-game-icon': 'components/workoutsRoadmap/svg/game-icon.svg',
                    'workouts-progress-drill-icon': 'components/workoutsRoadmap/svg/drill-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ])
        .directive('workoutsProgress',
            ["$timeout", "ExerciseStatusEnum", "$log", function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
                'ngInject';

                var config = {
                    focusAnimateDuration: 500,
                    focuseAnimationTimingFunction: 'ease-in-out',
                    mouseLeaveBeforeFocusDelay: 2000
                };

                var directive = {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html',
                    restrict: 'E',
                    require: 'ngModel',
                    scope: {
                        workoutsGetter: '&workouts',
                        diagnosticGetter: '&diagnostic',
                        activeWorkoutOrder: '@activeWorkoutOrder'
                    },
                    compile: function compile() {
                        return {
                            pre: function pre(scope) {
                                scope.vm = {};

                                var workouts = scope.workoutsGetter() || [];

                                scope.vm.workouts = workouts;
                                scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
                                //  added in order to treat the diagnostic as a workout what simplifies the code
                                scope.vm.diagnostic.workoutOrder = 0;
                            },
                            post: function post(scope, element, attrs, ngModelCtrl) {
                                var domElement = element[0];
                                var focusOnSelectedWorkoutTimeoutProm;

                                function mouseEnterEventListener() {
                                    if (focusOnSelectedWorkoutTimeoutProm) {
                                        $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
                                        focusOnSelectedWorkoutTimeoutProm = null;
                                    }
                                }

                                domElement.addEventListener('mouseenter', mouseEnterEventListener);

                                function mouseLeaveEventListener() {
                                    focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
                                        scope.vm.focusOnSelectedWorkout();
                                    }, config.mouseLeaveBeforeFocusDelay, false);
                                }

                                domElement.addEventListener('mouseleave', mouseLeaveEventListener);

                                function _setProgressLineWidth(activeWorkoutOrder) {
                                    var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
                                    if (itemsContainerDomeElement.length) {
                                        var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
                                        if (activeWorkoutDomElement) {
                                            var LEFT_OFFSET = 40;
                                            var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
                                            progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
                                        }
                                    }
                                }

                                scope.vm.focusOnSelectedWorkout = function () {
                                    var parentElement = element.parent();
                                    var parentDomElement = parentElement[0];
                                    if (!parentDomElement) {
                                        return;
                                    }
                                    var containerWidth = parentDomElement.offsetWidth;
                                    var containerCenter = containerWidth / 2;

                                    var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
                                    if (!selectedWorkoutDomElement) {
                                        return;
                                    }
                                    var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
                                    var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
                                    var offset = containerCenter - scrollLeft;
                                    scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
                                };

                                function _selectWorkout(itemOrder, skipSetViewValue) {
                                    itemOrder = +itemOrder;
                                    if (isNaN(itemOrder)) {
                                        $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
                                        return;
                                    }
                                    var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
                                    scope.vm.selectedWorkout = itemOrder;
                                    scope.vm.focusOnSelectedWorkout();
                                    var selectedItem = items[itemOrder];
                                    if (!skipSetViewValue) {
                                        ngModelCtrl.$setViewValue(selectedItem);
                                    }
                                }

                                scope.vm.workoutClick = function (itemOrder) {
                                    if (attrs.disabled) {
                                        return;
                                    }
                                    _selectWorkout(itemOrder);
                                };

                                ngModelCtrl.$render = function () {
                                    if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
                                        $timeout(function () {
                                            _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
                                            _setProgressLineWidth(scope.activeWorkoutOrder);
                                        }, 0, false);
                                    }
                                };

                                scope.$on('$destroy', function () {
                                    domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
                                    domElement.removeEventListener('mouseenter', mouseEnterEventListener);
                                });

                                // attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
                                //     if (angular.isDefined(newActiveWorkoutOrder)) {
                                //         _setProgressLineWidth(newActiveWorkoutOrder);
                                //     }
                                // });
                            }
                        };
                    }
                };

                return directive;
            }]
        );
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newWorkoutGeneratorGetter;
            this.setNewWorkoutGeneratorGetter = function(newWorkoutGeneratorGetter){
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };


            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function(workoutAvailTimesGetter){
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = ["$injector", "$log", "$q", function($injector, $log, $q){
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function(subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn){
                    if(!_newWorkoutGeneratorGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    if(!angular.isArray(subjectToIgnoreForNextDaily)){
                        subjectToIgnoreForNextDaily = subjectToIgnoreForNextDaily ? [subjectToIgnoreForNextDaily] : [];
                    }

                    var newExerciseGenerator = $injector.invoke(_newWorkoutGeneratorGetter);
                    return $q.when(newExerciseGenerator(subjectToIgnoreForNextDaily,workoutOrder,clickedOnChangeSubjectBtn));
                };

                WorkoutsRoadmapSrv.getWorkoutAvailTimes = function(){
                    if(!_workoutAvailTimesGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var workoutAvailTimes;
                    if(angular.isFunction(_workoutAvailTimesGetter)){
                        workoutAvailTimes = $injector.invoke(_workoutAvailTimesGetter);
                    }else{
                        workoutAvailTimes = _workoutAvailTimesGetter;
                    }

                    return $q.when(workoutAvailTimes);
                };

                return WorkoutsRoadmapSrv;
            }];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.workoutsRoadmap').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html",
    "<div ng-transclude class=\"main-container\"></div>\n" +
    "<div translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK\"\n" +
    "    class=\"lock-overlay-container\">\n" +
    "    <ng-switch on=\"vm.lockState\">\n" +
    "        <div class=\"diagnostic-not-completed\"\n" +
    "             ng-switch-when=\"1\">\n" +
    "            <div class=\"description\"\n" +
    "                 translate=\".DIAGNOSTIC_NOT_COMPLETED\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"prev-not-completed\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-dotted-arrow\"></svg-icon>\n" +
    "            <div class=\"description\"\n" +
    "                 translate=\".PREV_NOT_COMPLETED\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"3\" class=\"no-pro-social-sharing\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-lock\"></svg-icon>\n" +
    "            <!--<div class=\"text1\"-->\n" +
    "                 <!--translate=\".MORE_WORKOUTS\">-->\n" +
    "            <!--</div>-->\n" +
    "            <!--<div class=\"text2\"-->\n" +
    "                 <!--translate=\".TELL_FRIENDS\">-->\n" +
    "            <!--</div>-->\n" +
    "            <!--<md-button aria-label=\"{{'WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK.SHARE' | translate}}\"-->\n" +
    "                       <!--class=\"share-btn md-primary znk\"-->\n" +
    "                       <!--md-no-ink>-->\n" +
    "                <!--<svg-icon name=\"workouts-intro-lock-share-arrow\"></svg-icon>-->\n" +
    "                <!--<span translate=\".SHARE\"></span>-->\n" +
    "            <!--</md-button>-->\n" +
    "            <div class=\"text3 get-zinkerz-pro-text\"\n" +
    "                 translate=\".GET_ZINKERZ_PRO\">\n" +
    "            </div>\n" +
    "            <md-button class=\"upgrade-btn znk md-primary\" ng-click=\"vm.openPurchaseModal()\">\n" +
    "                <span translate=\".UPGRADE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"4\" class=\"no-pro\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-lock\"></svg-icon>\n" +
    "            <div class=\"description\" translate=\".MORE_PRACTICE\"></div>\n" +
    "            <div class=\"get-zinkerz-pro-text\" translate=\".GET_ZINKERZ_PRO\"></div>\n" +
    "            <md-button aria-label=\"{{'WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK.UPGRADE' | translate}}\"\n" +
    "                       class=\"upgrade-btn znk md-primary\"\n" +
    "                       ng-click=\"vm.openPurchaseModal()\">\n" +
    "                <span translate=\".UPGRADE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html",
    "<znk-scroll actions=\"vm.scrollActions\" scroll-on-mouse-wheel=\"true\">\n" +
    "    <div class=\"items-container\">\n" +
    "        <div class=\"dotted-lines-container\">\n" +
    "            <div class=\"dotted-line progress\"></div>\n" +
    "            <div class=\"dotted-line future\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container diagnostic\">\n" +
    "            <div class=\"item\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === vm.diagnostic.workoutOrder\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(vm.diagnostic.workoutOrder)\">\n" +
    "                <ng-switch on=\"vm.diagnostic.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\"\n" +
    "                              name=\"workouts-progress-check-mark-icon\"\n" +
    "                              ng-switch-when=\"2\">\n" +
    "                    </svg-icon>\n" +
    "                    <svg-icon class=\"flag-icon\"\n" +
    "                              name=\"workouts-progress-flag\"\n" +
    "                              ng-switch-default>\n" +
    "                    </svg-icon>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container\"\n" +
    "             ng-repeat=\"workout in vm.workouts\">\n" +
    "            <div class=\"item\"\n" +
    "                 subject-id-to-attr-drv=\"workout.subjectId\"\n" +
    "                 suffix=\"bg\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === workout.workoutOrder,\n" +
    "                    pristine: workout.subjectId === undefined\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(workout.workoutOrder)\">\n" +
    "                <ng-switch on=\"workout.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\" name=\"workouts-progress-check-mark-icon\" ng-switch-when=\"2\"></svg-icon>\n" +
    "                    <span ng-switch-default>\n" +
    "                        {{::workout.workoutOrder}}\n" +
    "                    </span>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "    </div>\n" +
    "</znk-scroll>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/change-subject-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 86.4 71.6\"\n" +
    "     class=\"workouts-roadmap-change-subject-svg\">\n" +
    "\n" +
    "<style type=\"text/css\">\n" +
    "    .workouts-roadmap-change-subject-svg{\n" +
    "        width: 10px;\n" +
    "    }\n" +
    "\n" +
    "    .workouts-roadmap-change-subject-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 1.6864;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "</style>\n" +
    "\n" +
    "<g>\n" +
    "	<path id=\"XMLID_70_\" class=\"st0\" d=\"M8.5,29.4C11.7,13.1,26,0.8,43.2,0.8c17.5,0,32,12.7,34.8,29.5\"/>\n" +
    "	<polyline id=\"XMLID_69_\" class=\"st0\" points=\"65.7,24 78.3,30.3 85.7,18.7 	\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<path id=\"XMLID_68_\" class=\"st0\" d=\"M77.9,42.2c-3.2,16.3-17.5,28.6-34.7,28.6c-17.5,0-32-12.7-34.8-29.5\"/>\n" +
    "	<polyline id=\"XMLID_67_\" class=\"st0\" points=\"20.7,47.6 8.1,41.3 0.7,52.9 	\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg",
    "<svg\n" +
    "	class=\"complete-v-icon-svg\"\n" +
    "	xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "	xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "	y=\"0px\"\n" +
    "	viewBox=\"-1040 834.9 220.4 220.4\"\n" +
    "	style=\"enable-background:new -1040 834.9 220.4 220.4;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "    .complete-v-icon-svg{\n" +
    "        width: 110px;\n" +
    "    }\n" +
    "\n" +
    "	.complete-v-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st1 {\n" +
    "        fill: #CACBCC;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st2 {\n" +
    "        display: none;\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st3 {\n" +
    "        fill: #D1D2D2;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st4 {\n" +
    "        fill: none;\n" +
    "        stroke: #FFFFFF;\n" +
    "        stroke-width: 11.9321;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/dotted-arrow.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     class=\"workouts-intro-lock-dotted-arrow-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-406.9 425.5 190.9 175.7\">\n" +
    "    <style>\n" +
    "        .workouts-intro-lock-dotted-arrow-svg{\n" +
    "            width: 53px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-intro-lock-dotted-arrow-svg circle{\n" +
    "            stroke: #161616;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/drill-icon.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 199 87\"\n" +
    "     class=\"workouts-progress-drill-svg\">\n" +
    "    <style>\n" +
    "        .workouts-progress-drill-svg {\n" +
    "            width: 20px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 16;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st3 {\n" +
    "            clip-path: url(#SVGID_2_);\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 11;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st4 {\n" +
    "            clip-path: url(#SVGID_4_);\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 11;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <line class=\"st0\" x1=\"64\" y1=\"45\" x2=\"138\" y2=\"45\"/>\n" +
    "        <g>\n" +
    "            <line class=\"st1\" x1=\"47\" y1=\"8\" x2=\"47\" y2=\"79\"/>\n" +
    "            <line class=\"st2\" x1=\"29\" y1=\"22\" x2=\"29\" y2=\"65\"/>\n" +
    "            <g>\n" +
    "                <defs>\n" +
    "                    <rect id=\"SVGID_1_\" y=\"38\" width=\"17\" height=\"17\"/>\n" +
    "                </defs>\n" +
    "                <clipPath id=\"SVGID_2_\">\n" +
    "                    <use xlink:href=\"#SVGID_1_\" style=\"overflow:visible;\"/>\n" +
    "                </clipPath>\n" +
    "                <line class=\"st3\" x1=\"18\" y1=\"45.5\" x2=\"24\" y2=\"45.5\"/>\n" +
    "            </g>\n" +
    "        </g>\n" +
    "        <g>\n" +
    "            <line class=\"st1\" x1=\"154\" y1=\"8\" x2=\"154\" y2=\"79\"/>\n" +
    "            <line class=\"st2\" x1=\"172\" y1=\"22\" x2=\"172\" y2=\"65\"/>\n" +
    "            <g>\n" +
    "                <defs>\n" +
    "                    <rect id=\"SVGID_3_\" x=\"182\" y=\"38\" width=\"17\" height=\"17\"/>\n" +
    "                </defs>\n" +
    "                <clipPath id=\"SVGID_4_\">\n" +
    "                    <use xlink:href=\"#SVGID_3_\" style=\"overflow:visible;\"/>\n" +
    "                </clipPath>\n" +
    "                <line class=\"st4\" x1=\"183\" y1=\"45.5\" x2=\"177\" y2=\"45.5\"/>\n" +
    "            </g>\n" +
    "        </g>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg{\n" +
    "            width: 23px;\n" +
    "        }\n" +
    "\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/game-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 127 147.8\"\n" +
    "     class=\"workouts-progress-game-svg\">\n" +
    "    <style>\n" +
    "        .workouts-progress-game-svg {\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st0 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st1 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-miterlimit: 10;\n" +
    "            fill: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st2 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            fill: #acacac;\n" +
    "            stroke: #acacac;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "        /*.workouts-progress-game-svg circle {*/\n" +
    "            /*stroke: #acacac;*/\n" +
    "            /*fill: none;*/\n" +
    "        /*}*/\n" +
    "\n" +
    "        /*.workouts-progress-game-svg circle.st1 {*/\n" +
    "            /*fill: #acacac;*/\n" +
    "        /*}*/\n" +
    "\n" +
    "        /*.workouts-progress-game-svg path {*/\n" +
    "            /*fill: #acacac;*/\n" +
    "        /*}*/\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"st0\" cx=\"63.5\" cy=\"84.2\" r=\"60.5\"/>\n" +
    "        <circle class=\"st1\" cx=\"63.7\" cy=\"84.2\" r=\"6.2\"/>\n" +
    "        <path class=\"st1\" d=\"M65.2,73.8h-2.5c-0.7,0-1.2-0.3-1.2-0.7V41.5c0-0.4,0.5-0.7,1.2-0.7h2.5c0.7,0,1.2,0.3,1.2,0.7V73\n" +
    "		C66.4,73.4,65.9,73.8,65.2,73.8z\"/>\n" +
    "        <path class=\"st2\" d=\"M73.7,80.9l-1.6-2.7c-0.3-0.6-0.3-1.2,0.1-1.4l11.6-6.9c0.4-0.2,1,0,1.3,0.6l1.6,2.7c0.3,0.6,0.3,1.2-0.1,1.4\n" +
    "		L75,81.5C74.6,81.7,74,81.5,73.7,80.9z\"/>\n" +
    "        <path class=\"st1\" d=\"M58,9.5v4.6c0,2.9,2.4,5.3,5.3,5.3c2.9,0,5.3-2.4,5.3-5.3V9.5H58z\"/>\n" +
    "        <path class=\"st1\" d=\"M79.2,3.1c0,1.7-1.4,3.1-3.1,3.1H51.6c-1.7,0-3.1-1.4-3.1-3.1l0,0c0-1.7,1.4-3.1,3.1-3.1h24.5\n" +
    "		C77.8,0,79.2,1.4,79.2,3.1L79.2,3.1z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/lock-icon.svg",
    "<svg class=\"workouts-intro-lock-lock-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        svg.workouts-intro-lock-lock-svg {\n" +
    "            width: 37px;\n" +
    "        }\n" +
    "\n" +
    "        svg.workouts-intro-lock-lock-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #161616;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        svg.workouts-intro-lock-lock-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #161616;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/practice-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 255.2 169\"\n" +
    "     class=\"practice-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "    .practice-icon-svg{\n" +
    "        width: 20px;\n" +
    "    }\n" +
    "\n" +
    "    .practice-icon-svg .st0{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-linejoin:round;\n" +
    "    }\n" +
    "\n" +
    "    .practice-icon-svg .st1{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "    }\n" +
    "\n" +
    "	.practice-icon-svg .st2{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-linejoin:round;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<polyline class=\"st0\"\n" +
    "              points=\"142,41 3,41 3,166 59,166\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"75\"\n" +
    "          x2=\"93\"\n" +
    "          y2=\"75\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"102\"\n" +
    "          x2=\"77\"\n" +
    "          y2=\"102\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"129\"\n" +
    "          x2=\"79\"\n" +
    "          y2=\"129\"/>\n" +
    "	<polygon class=\"st0\"\n" +
    "             points=\"216.8,3 111.2,106.8 93,161.8 146.8,146 252.2,41\"/>\n" +
    "	<line class=\"st2\"\n" +
    "          x1=\"193.2\"\n" +
    "          y1=\"31.7\"\n" +
    "          x2=\"224\"\n" +
    "          y2=\"64.8\"/>\n" +
    "	<polygon points=\"102.5,139.7 114.5,153.8 97.2,157.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/share-arrow-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 149.8 116.7\"\n" +
    "     class=\"share-icon-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .share-icon-svg {\n" +
    "            width: 16px;\n" +
    "        }\n" +
    "\n" +
    "        .share-icon-svg path{\n" +
    "            fill: white;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path d=\"M74.7,33.6c0-11.1,0-21.7,0-33.6c25.4,19.7,49.9,38.8,75.1,58.4c-25,19.5-49.6,38.6-74.9,58.3c0-11.5,0-22,0-32.5\n" +
    "		c-21.6-5.7-49.4,6.1-74.5,31.2c-2.4-12.2,5.4-38.4,21-55C35.9,45,53.7,36.3,74.7,33.6z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/tutorial-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 143.2 207.8\"\n" +
    "    class=\"tips-n-tricks-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .tips-n-tricks-svg {\n" +
    "            width: 11px;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg path {\n" +
    "            fill: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-linecap: round;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M70.5,2.8\"/>\n" +
    "        <path class=\"st1\" d=\"M110,157.5c0,0-5.1-21,8.7-38.8c10.5-13.5,19.5-28.7,19.5-47.1C138.2,34.8,108.4,5,71.6,5S5,34.8,5,71.6\n" +
    "		c0,18.4,9.1,33.6,19.5,47.1c13.8,17.8,8.7,38.8,8.7,38.8\"/>\n" +
    "        <line class=\"st2\" x1=\"41.8\" y1=\"166.5\" x2=\"101.8\" y2=\"166.5\"/>\n" +
    "        <line class=\"st2\" x1=\"39.8\" y1=\"178.5\" x2=\"103.8\" y2=\"178.5\"/>\n" +
    "        <line class=\"st2\" x1=\"45.8\" y1=\"190.5\" x2=\"95.8\" y2=\"190.5\"/>\n" +
    "        <path d=\"M87.5,198.5c-1.2,6.2-7.3,9.3-16.4,9.3s-14.4-3.3-16.4-9.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/workout-roadmap-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"workout-roadmap-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .workout-roadmap-check-mark-svg{\n" +
    "            width: 30px;\n" +
    "        }\n" +
    "\n" +
    "        .workout-roadmap-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmap.template.html",
    "<div class=\"workouts-roadmap-container\">\n" +
    "    <div class=\"workouts-roadmap-wrapper base-border-radius base-box-shadow\">\n" +
    "        <workouts-progress workouts=\"vm.workoutsProgress\"\n" +
    "                           ng-disabled=\"vm.freezeWorkoutProgressComponent\"\n" +
    "                           diagnostic=\"vm.diagnostic\"\n" +
    "                           active-workout-order=\"{{vm.activeWorkoutOrder}}\"\n" +
    "                           ng-model=\"vm.selectedItem\">\n" +
    "        </workouts-progress>\n" +
    "        <div class=\"workouts-container\"\n" +
    "             ng-class=\"vm.workoutSwitchAnimation\">\n" +
    "            <ui-view class=\"workouts-ui-view\"></ui-view>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <estimated-score-widget is-nav-menu=\"false\" widget-title=\".TITLE\" ng-model=\"currentSubjectId\"></estimated-score-widget>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html",
    "<div class=\"workouts-roadmap-base-pre-summary base-workouts-wrapper\"\n" +
    "     translate-namespace=\"ROADMAP_BASE_PRE_SUMMARY\">\n" +
    "    <div>\n" +
    "        <div class=\"diagnostic-workout-title\">{{::vm.text}}</div>\n" +
    "        <svg-icon class=\"checkmark-icon\"\n" +
    "                  name=\"workouts-roadmap-checkmark\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"complete-text\"\n" +
    "             translate=\".COMPLETE\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html",
    "<div translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO\"\n" +
    "     class=\"workouts-roadmap-diagnostic-intro base-workouts-wrapper\">\n" +
    "    <div>\n" +
    "        <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "        <diagnostic-intro></diagnostic-intro>\n" +
    "        <md-button  class=\"md-primary znk\"\n" +
    "                    autofocus\n" +
    "                    tabindex=\"1\"\n" +
    "                    ui-sref=\"app.diagnostic({ skipIntro: true, forceSkipIntro: vm.forceSkipIntro })\"\n" +
    "                    aria-label=\"{{::vm.buttonTitle}}\"\n" +
    "                    translate=\"{{vm.buttonTitle}}\"\n" +
    "                    md-no-ink>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticSummary.template.html",
    "<div class=\"workouts-roadmap-diagnostic-summary base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_SUMMERY\">\n" +
    "    <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "    <div class=\"results-text\" translate=\".DIAG_RES_TEXT\"></div>\n" +
    "    <div class=\"total-score\"\n" +
    "         ng-if=\"!vm.isSubjectsWaitToBeEvaluated  && !vm.ignoreCompositeScore\"\n" +
    "         translate=\".DIAG_COMPOS_SCORE\"\n" +
    "         translate-values=\"{total: vm.compositeScore }\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"first-row\">\n" +
    "        <div ng-repeat=\"subject in vm.diagnosticSubjects\"\n" +
    "             ng-class=\"subject.subjectNameAlias\"\n" +
    "             class=\"subject-score\">\n" +
    "            <svg-icon class=\"icon-wrapper\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "            <div class=\"score-wrapper\">\n" +
    "                <div class=\"score\" translate=\".{{subject.subjectNameAlias | uppercase}}\"></div>\n" +
    "                <span class=\"bold\">{{::vm.userStats[subject.id] || '-'}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html",
    "<div class=\"workouts-roadmap-workout-in-progress base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_IN_PROGRESS\">\n" +
    "    <div class=\"workouts-roadmap-workout-in-progress-wrapper\">\n" +
    "        <div class=\"title-wrapper\">\n" +
    "            <div translate=\".TITLE\"\n" +
    "                 translate-values=\"{workoutOrder: vm.workout.workoutOrder}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <svg-icon class=\"subject-icon\"\n" +
    "                  subject-id-to-attr-drv=\"vm.workout.subjectId\"\n" +
    "                  context-attr=\"name\"\n" +
    "                  suffix=\"icon\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"subject-title\"\n" +
    "             translate=\"SUBJECTS.{{vm.workout.subjectId}}\">\n" +
    "        </div>\n" +
    "        <div class=\"keep-going-text\" translate=\".KEEP_GOING\"></div>\n" +
    "        <div class=\"answered-text\"\n" +
    "             translate=\".ANSWERED\"\n" +
    "             translate-values=\"{\n" +
    "                answered: vm.exerciseResult.totalAnsweredNum,\n" +
    "                total: vm.exerciseResult.totalQuestionNum\n" +
    "             }\">\n" +
    "        </div>\n" +
    "        <md-button aria-label=\"{{'WORKOUTS_ROADMAP_WORKOUT_IN_PROGRESS.CONTINUE' | translate}}\"\n" +
    "            class=\"znk md-primary continue-btn\"\n" +
    "                   ui-sref=\"app.workouts.workout({workout: vm.workout.workoutOrder})\">\n" +
    "            <span translate=\".CONTINUE\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html",
    "<div class=\"workouts-roadmap-workout-intro base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_INTRO\">\n" +
    "    <div class=\"workouts-roadmap-intro-wrapper\">\n" +
    "        <div class=\"title-wrapper\">\n" +
    "            <div translate=\".TITLE\"\n" +
    "                 translate-values=\"{workoutOrder: vm.workoutOrder}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <workout-intro-lock workouts-progress=\"vm.workoutsProgress\">\n" +
    "            <svg-icon class=\"subject-icon\"\n" +
    "                      subject-id-to-attr-drv=\"vm.selectedWorkout.subjectId\"\n" +
    "                      context-attr=\"name\"\n" +
    "                      suffix=\"icon\">\n" +
    "            </svg-icon>\n" +
    "            <div class=\"subject-title\"\n" +
    "                 translate=\"SUBJECTS.{{vm.selectedWorkout.subjectId}}\">\n" +
    "            </div>\n" +
    "            <div class=\"change-subject-container\"\n" +
    "                 ng-class=\"{\n" +
    "                'rotate': vm.rotate\n" +
    "             }\"\n" +
    "                 ng-click=\"vm.rotate = !vm.rotate; vm.changeSubject()\">\n" +
    "                <svg-icon name=\"workouts-roadmap-change-subject\"></svg-icon>\n" +
    "            <span class=\"change-subject-title\"\n" +
    "                  translate=\".CHANGE_SUBJECT\">\n" +
    "            </span>\n" +
    "            </div>\n" +
    "            <div class=\"how-much-time-title\"\n" +
    "                 translate=\".HOW_MUCH_TIME\">\n" +
    "            </div>\n" +
    "            <div class=\"workout-time-selection-container\">\n" +
    "                <div class=\"avail-time-item-wrapper\"\n" +
    "                     ng-disabled=\"!vm.workoutsByTime[workoutAvailTime]\"\n" +
    "                     ng-repeat=\"workoutAvailTime in vm.workoutAvailTimes\">\n" +
    "                    <div class=\"avail-time-item\"\n" +
    "                         ng-class=\"{\n" +
    "                        active: vm.selectedTime === workoutAvailTime\n" +
    "                     }\"\n" +
    "                         ng-click=\"vm.selectTime(workoutAvailTime)\">\n" +
    "                        <svg-icon class=\"workout-icon\"\n" +
    "                                  name=\"{{vm.getWorkoutIcon(workoutAvailTime);}}\">\n" +
    "\n" +
    "                        </svg-icon>\n" +
    "                        <span class=\"avail-time-text\">{{workoutAvailTime}}</span>\n" +
    "                    <span class=\"minutes-text\"\n" +
    "                          translate=\".MINUTES\">\n" +
    "                    </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"start-btn-wrapper\">\n" +
    "                <md-button aria-label=\"{{'WORKOUTS_ROADMAP_WORKOUT_INTRO.START' | translate}}\"\n" +
    "                           class=\"md-primary znk\"\n" +
    "                           ng-click=\"vm.startExercise()\"\n" +
    "                           md-no-ink>\n" +
    "                    <span translate=\".START\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </workout-intro-lock>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
