(function(){
    'use strict';

    angular.module('znk.infra-web-app.completeExercise',[
        'ngAnimate',
        'pascalprecht.translate',
        'ngMaterial',
        'znk.infra.exerciseUtility',
        'znk.infra.contentGetters',
        'znk.infra.userContext',
        'znk.infra.user',
        'znk.infra.general',
        'znk.infra.filters',
        'znk.infra.znkExercise',
        'znk.infra.stats',
        'znk.infra.popUp'
    ]);
})();

(function (angular) {
    'use strict';

    /**
     * exerciseDetails:
     *   exerciseTypeId
     *   exerciseId
     *   exerciseParentTypeId
     *   exerciseParentId
     *
     * ########
     * settings:
     *   exitAction
     *
     * ########
     *   translations:
     *      SECTION_INSTRUCTION:{
     *          subjectId: instructions for subject
     *      }
     * */
    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExercise/completeExerciseDirective.template.html',
            bindings: {
                exerciseDetails: '<',
                settings: '<'
            },
            controller: ["$log", "ExerciseResultSrv", "ExerciseTypeEnum", "$q", "BaseExerciseGetterSrv", "CompleteExerciseSrv", "$translatePartialLoader", "ExerciseParentEnum", "$timeout", function ($log, ExerciseResultSrv, ExerciseTypeEnum, $q, BaseExerciseGetterSrv, CompleteExerciseSrv, $translatePartialLoader, ExerciseParentEnum, $timeout) {
                'ngInject';

                var $ctrl = this;

                var VIEW_STATES = CompleteExerciseSrv.VIEW_STATES;

                function _rebuildExercise() {

                    $ctrl.changeViewState(VIEW_STATES.NONE);

                    $timeout(function () {
                        var exerciseDetails = $ctrl.exerciseDetails;

                        var isExam = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.EXAM.enum;
                        var exerciseParentContent = isExam ? BaseExerciseGetterSrv.getExerciseByNameAndId('exam', exerciseDetails.exerciseParentId) : null;

                        var getDataPromMap = {
                            exerciseResult: CompleteExerciseSrv.getExerciseResult(exerciseDetails),
                            exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseDetails.exerciseTypeId, exerciseDetails.exerciseId),
                            exerciseParentContent: exerciseParentContent
                        };
                        $q.all(getDataPromMap).then(function (data) {
                            $ctrl.exerciseData = data;
                            var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                            var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;
                            if ((isSection || isTutorial) && !data.exerciseResult.seenIntro) {
                                $ctrl.changeViewState(VIEW_STATES.INTRO);
                                return;
                            }

                            var isExerciseCompleted = data.exerciseResult.isComplete;
                            if(isExerciseCompleted){
                                $ctrl.changeViewState(VIEW_STATES.SUMMARY);
                            }else{
                                $ctrl.changeViewState(VIEW_STATES.EXERCISE);
                            }
                        });
                    });
                }

                function _getGetterFnName(propName) {
                    return 'get' + propName[0].toUpperCase() + propName.substr(1);
                }

                function _createPropGetters(propArray, contextObjectName) {
                    propArray.forEach(function (propName) {
                        var getterFnName = _getGetterFnName(propName);
                        $ctrl[getterFnName] = function () {
                            return $ctrl[contextObjectName][propName];
                        };
                    });
                }

                this.changeViewState = function (newViewState) {
                    $ctrl.currViewState = newViewState;
                };

                this.$onInit = function () {
                    var exerciseDetailsPropsToCreateGetters = [
                        'exerciseParentTypeId',
                        'exerciseParentId',
                        'exerciseTypeId'
                    ];
                    _createPropGetters(exerciseDetailsPropsToCreateGetters, 'exerciseDetails');

                    var exerciseDataPropsToCreateGetters = [
                        'exerciseContent',
                        'exerciseParentContent',
                        'exerciseResult'
                    ];
                    _createPropGetters(exerciseDataPropsToCreateGetters, 'exerciseData');
                };

                this.$onChanges = function (changesObj) {
                    if (!changesObj.exerciseDetails.currentValue) {
                        $ctrl.changeViewState(VIEW_STATES.NONE);
                        return;
                    }

                    var newExerciseDetails = changesObj.exerciseDetails.currentValue;

                    var isExerciseParentTypeIdNotProvided = angular.isUndefined(newExerciseDetails.exerciseParentTypeId);
                    var isExerciseTypeIdNotProvided = angular.isUndefined(newExerciseDetails.exerciseTypeId);
                    var isExerciseIdNotProvided = angular.isUndefined(newExerciseDetails.exerciseId);
                    if (isExerciseParentTypeIdNotProvided || isExerciseTypeIdNotProvided || isExerciseIdNotProvided) {
                        $log.error('completeExercise: new exerciseDetails is missing data');
                        return;
                    }

                    _rebuildExercise();
                };

                $translatePartialLoader.addPart('completeExercise');
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: ["$controller", "CompleteExerciseSrv", "$q", "$translate", "PopUpSrv", function ($controller, CompleteExerciseSrv, $q, $translate, PopUpSrv) {
                'ngInject';

                var $ctrl = this;

                function _initTimersVitalData(){
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();

                    if(!exerciseContent.time){
                        return;
                    }

                    $ctrl.timeEnabled = true;

                    if(angular.isUndefined(exerciseResult.duration)){
                        exerciseResult.duration = 0;
                    }

                    $ctrl.timerConfig = {
                        countDown: true,
                        max: exerciseContent.time
                    };
                }

                function _invokeExerciseCtrl(){
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();

                    var settings = {
                        exerciseContent: exerciseContent,
                        exerciseResult: exerciseResult,
                        actions:{
                            done: function(){
                                $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                            }
                        }
                    };

                    $ctrl.znkExercise = $controller('CompleteExerciseBaseZnkExerciseCtrl',{
                        settings: settings
                    });
                }

                this.$onInit = function () {
                    _initTimersVitalData();

                    _invokeExerciseCtrl();

                    this.durationChanged = function(){
                        var exerciseResult = this.completeExerciseCtrl.getExerciseResult();
                        var exerciseContent = this.completeExerciseCtrl.getExerciseContent();

                        if(exerciseResult.duration >= exerciseContent.time){
                            var contentProm = $translate('COMPLETE_EXERCISE.TIME_UP_CONTENT');
                            var titleProm = $translate('COMPLETE_EXERCISE.TIME_UP_TITLE');
                            var buttonFinishProm = $translate('COMPLETE_EXERCISE.STOP');
                            var buttonContinueProm = $translate('COMPLETE_EXERCISE.CONTINUE_BTN');

                            $q.all([contentProm, titleProm, buttonFinishProm, buttonContinueProm]).then(function (results) {
                                var content = results[0];
                                var title = results[1];
                                var buttonFinish = results[2];
                                var buttonContinue = results[3];
                                var timeOverPopupPromise = PopUpSrv.ErrorConfirmation(title, content, buttonFinish, buttonContinue).promise;

                                timeOverPopupPromise.then(function () {
                                    $ctrl.znkExercise._finishExercise();
                                });
                            });
                        }
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    /**
     *   settings:
     *      exerciseContent:
     *      exerciseResult:
     *      actions:{
     *          done: invoked once user finished the exercise
     *      }
     *
     *
     *  return controller with following prop:
     *      exerciseContent
     *      exerciseResult
     *
     * */
    angular.module('znk.infra-web-app.completeExercise').controller('CompleteExerciseBaseZnkExerciseCtrl',
        ["settings", "ExerciseTypeEnum", "ZnkExerciseUtilitySrv", "ZnkExerciseViewModeEnum", "$q", "$translate", "PopUpSrv", "$log", "znkAnalyticsSrv", "ZnkExerciseSrv", "exerciseEventsConst", "StatsEventsHandlerSrv", "$rootScope", "$location", "ENV", function (settings, ExerciseTypeEnum, ZnkExerciseUtilitySrv, ZnkExerciseViewModeEnum, $q, $translate, PopUpSrv, $log, znkAnalyticsSrv, ZnkExerciseSrv, exerciseEventsConst, StatsEventsHandlerSrv, $rootScope, $location, ENV) {
            'ngInject';

            var exerciseContent = settings.exerciseContent;
            var exerciseResult = settings.exerciseResult;
            var exerciseTypeId = exerciseResult.exerciseTypeId;

            var $ctrl = this;

            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
            var initSlideIndex;

            function _setExerciseResult() {
                if (!angular.isArray(exerciseResult.questionResults) || exerciseResult.questionResults.length === 0) {
                    exerciseResult.questionResults = exerciseContent.questions.map(function (question) {
                        return {
                            questionId: question.id,
                            categoryId: question.categoryId
                        };
                    });
                }

                if (angular.isUndefined(exerciseResult.startedTime)) {
                    exerciseResult.startedTime = Date.now();
                }
            }

            function _setExerciseContentQuestions() {
                exerciseContent.questions = exerciseContent.questions.sort(function (a, b) {
                    return a.order - b.order;
                });

                ZnkExerciseUtilitySrv.setQuestionsGroupData(
                    exerciseContent.questions,
                    exerciseContent.questionsGroupData
                );
            }

            function _finishExercise() {
                exerciseResult.isComplete = true;
                exerciseResult.endedTime = Date.now();
                exerciseResult.$save();

                //  stats exercise data
                StatsEventsHandlerSrv.addNewExerciseResult(exerciseTypeId, exerciseContent, exerciseResult).then(function () {
                    $ctrl.settings.viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;

                    var exerciseTypeValue = ExerciseTypeEnum.getValByEnum(exerciseTypeId).toLowerCase();
                    var broadcastEventName = exerciseEventsConst[exerciseTypeValue].FINISH;
                    $rootScope.$broadcast(broadcastEventName, exerciseContent, exerciseResult);

                    settings.actions.done();
                });
            }

            var _setZnkExerciseSettings = (function () {
                function getNumOfUnansweredQuestions(questionsResults) {
                    var numOfUnansweredQuestions = questionsResults.length;
                    var keysArr = Object.keys(questionsResults);
                    angular.forEach(keysArr, function (i) {
                        var questionAnswer = questionsResults[i];
                        if (angular.isDefined(questionAnswer.userAnswer)) {
                            numOfUnansweredQuestions--;
                        }
                    });
                    return numOfUnansweredQuestions;
                }

                function _getAllowedTimeForExercise() {
                    if (exerciseTypeId === ExerciseTypeEnum.SECTION.enum) {
                        return exerciseContent.time;
                    }

                    var allowedTimeForQuestion = ZnkExerciseSrv.getAllowedTimeForQuestion(exerciseTypeId);
                    return allowedTimeForQuestion * exerciseContent.questions.length;
                }

                return function () {
                    var viewMode;

                    if (exerciseResult.isComplete) {
                        viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;
                        initSlideIndex = 0;
                    } else {
                        viewMode = isSection ? ZnkExerciseViewModeEnum.ONLY_ANSWER.enum : ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum;
                        initSlideIndex = exerciseResult.questionResults.findIndex(function (question) {
                            return !question.userAnswer;
                        });

                        if (initSlideIndex === -1) {
                            initSlideIndex = 0;
                        }
                    }

                    var defExerciseSettings = {
                        onDone: function onDone() {
                            var numOfUnansweredQuestions = getNumOfUnansweredQuestions(exerciseResult.questionResults);

                            var areAllQuestionsAnsweredProm = $q.when(true);
                            if (numOfUnansweredQuestions) {
                                var contentProm = $translate('COMPLETE_EXERCISE.SOME_ANSWER_LEFT_CONTENT');
                                var titleProm = $translate('COMPLETE_EXERCISE.FINISH_TITLE');
                                var buttonGoToProm = $translate('COMPLETE_EXERCISE.GO_TO_SUMMARY_BTN');
                                var buttonStayProm = $translate('COMPLETE_EXERCISE.STAY_BTN');

                                areAllQuestionsAnsweredProm = $q.all([contentProm, titleProm, buttonGoToProm, buttonStayProm]).then(function (results) {
                                    var content = results[0];
                                    var title = results[1];
                                    var buttonGoTo = results[2];
                                    var buttonStay = results[3];
                                    return PopUpSrv.warning(title, content, buttonGoTo, buttonStay).promise;
                                }, function (err) {
                                    $log.error(err);
                                });
                            }
                            areAllQuestionsAnsweredProm.then(function () {
                                _finishExercise();
                            });
                        },
                        onQuestionAnswered: function onQuestionAnswered() {
                            exerciseResult.$save();
                        },
                        onSlideChange: function (currQuestion, currentIndex) {
                            var indexPlusOne = currentIndex + 1;
                            znkAnalyticsSrv.pageTrack({
                                props: {
                                    url: $location.url() + '/index/' + indexPlusOne + '/questionId/' + (currQuestion.id || '')
                                }
                            });
                        },
                        viewMode: viewMode,
                        initSlideIndex: initSlideIndex || 0,
                        allowedTimeForExercise: _getAllowedTimeForExercise(),
                        toolBox:{
                            drawing:{
                                exerciseDrawingPathPrefix: exerciseResult.uid,
                                toucheColorId: ENV.appContext === 'student' ? 1 : 2
                            }
                        }
                    };

                    $ctrl.settings = defExerciseSettings;
                };
            })();

            function _init() {
                _setExerciseResult();

                _setExerciseContentQuestions();

                _setZnkExerciseSettings();

                $ctrl.exerciseContent = exerciseContent;
                $ctrl.exerciseResult = exerciseResult;
                $ctrl._finishExercise = _finishExercise;
            }

            _init();
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseHeader', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseHeader/completeExerciseHeaderDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            transclude:{
                'centerPart': '?centerPart',
                'preRightPart': '?preRightPart'
            },
            controller: ["$translate", "$q", function ($translate, $q) {
                'ngInject';

                var $ctrl = this;

                function _setLeftTitle(){
                    var exerciseParentTypeId = $ctrl.completeExerciseCtrl.getExerciseParentTypeId();
                    var titlePrefixTranslateKey = 'COMPLETE_EXERCISE.EXERCISE_PARENT.TYPE_' + exerciseParentTypeId ;
                    var translateData = {
                        exerciseParentId: $ctrl.completeExerciseCtrl.getExerciseParentId(),
                        exerciseContent: $ctrl.completeExerciseCtrl.getExerciseContent(),
                        exerciseParentContent: $ctrl.completeExerciseCtrl.getExerciseParentContent()
                    };
                    var translatePromMap = {
                        leftTitle: $translate(titlePrefixTranslateKey, translateData)
                    };
                    $q.all(translatePromMap).then(function(translationMap){
                        $ctrl.leftTitle = translationMap.leftTitle;
                    });
                }

                this.$onInit = function(){
                    _setLeftTitle();

                    $ctrl.exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntro', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntro/completeExerciseIntroDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: ["CompleteExerciseSrv", function (CompleteExerciseSrv) {
                'ngInject';

                var $ctrl = this;

                this.$onInit = function () {
                    var fnToCopyFromCompleteExerciseCtrl = [
                        'getExerciseContent',
                        'getExerciseParentContent'
                    ];
                    fnToCopyFromCompleteExerciseCtrl.forEach(function (fnName) {
                        $ctrl[fnName] = $ctrl.completeExerciseCtrl[fnName].bind($ctrl.completeExerciseCtrl);
                    });

                    this.exerciseTypeId = this.completeExerciseCtrl.exerciseDetails.exerciseTypeId;

                    this.goToQuestions = function () {
                        var exerciseResult = this.completeExerciseCtrl.getExerciseResult();
                        exerciseResult.seenIntro = true;
                        exerciseResult.$save();
                        $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.EXERCISE);
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroSection', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSectionDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: ["$filter", function ($filter) {
                'ngInject';

                this.$onInit = function(){
                    var exerciseParentContent = this.completeExerciseIntroCtrl.getExerciseParentContent();
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseContent = exerciseContent;
                    this.exerciseParentContent = exerciseParentContent;

                    var timeDurationFilter = $filter('formatTimeDuration');
                    this.timeTranslateValue = {
                        min: timeDurationFilter(exerciseContent .time, 'mm'),
                        sec: timeDurationFilter(exerciseContent .time, 'rss')
                    };

                    this.start = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroTutorial', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroTutorial/completeExerciseIntroTutorialDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: ["ENV", "ExerciseTypeEnum", "$sce", function (ENV, ExerciseTypeEnum, $sce) {
                'ngInject';

                this.$onInit = function () {
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseContent = exerciseContent;

                    this.videoSrc = $sce.trustAsResourceUrl(ENV.videosEndPoint + 'videos/' + 'tutorials' + '/' + exerciseContent.id + '.mp4');

                    this.trustAsHtml = function (html) {
                        return $sce.trustAsHtml(html);
                    };

                    this.goToQuestions = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseProgressBar',
            ["$animate", "$timeout", function ($animate, $timeout) {
                'ngInject';

                var directive = {
                    restrict: 'E',
                    templateUrl: 'components/completeExercise/directives/completeExerciseProgressBar/completeExerciseProgressBarDirective.template.html',
                    scope: {
                        totalTime: '@',
                        duration: '<'
                    },
                    link: function (scope, element) {
                        var isAnimationSet, prevCls;
                        var BAR_CLASSES = {
                            'GREEN': 'green-state',
                            'YELLOW': 'yellow-state',
                            'RED': 'red-state',

                        };

                        function _getTotalTime() {
                            return +scope.totalTime;
                        }

                        function _getDuration() {
                            return scope.duration || 0;
                        }

                        function _getDurationPercentage() {
                            var totalTime = _getTotalTime();
                            var duration = _getDuration();
                            return parseInt(duration / totalTime * 100, 10);
                        }

                        function _setAnimation() {
                            var domElement = element[0];
                            var progressBarDomElement = domElement.querySelector('.progress-bar');

                            var durationPercentage = _getDurationPercentage();
                            var parentWidth = domElement.offsetWidth;
                            var translateX = (parseInt(parentWidth * (durationPercentage / 100), 10) - parentWidth) + 'px';
                            progressBarDomElement.style.transform = 'translateX(' + translateX + ')';

                            var fromCss = {};
                            var totalTime = _getTotalTime();
                            var duration = _getDuration();
                            var timeLeft = totalTime - duration;
                            fromCss.transition = 'transform linear ' + timeLeft + 'ms';

                            var toCss = {
                                transform: 'translateX(0)'
                            };
                            $timeout(function(){
                                $animate.animate(progressBarDomElement, fromCss, toCss);
                            });
                        }

                        function _getBarColorClass(durationPercentage) {
                            if (durationPercentage > 70) {
                                return BAR_CLASSES.RED;
                            }

                            if (durationPercentage > 40) {
                                return BAR_CLASSES.YELLOW;
                            }

                            return BAR_CLASSES.GREEN;
                        }

                        scope.$watch('duration', function (newDuration) {
                            if (angular.isUndefined(newDuration)) {
                                return;
                            }

                            if (!isAnimationSet) {
                                _setAnimation();
                                isAnimationSet = true;
                            }

                            var durationPercentage = _getDurationPercentage();
                            var clsToAdd = _getBarColorClass(durationPercentage);

                            if (prevCls === clsToAdd) {
                                return;
                            }

                            element.addClass(clsToAdd);
                            element.removeClass(prevCls);
                            prevCls = clsToAdd;
                        });
                    }
                };

                return directive;
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseTimerParser', function completeExerciseTimer(){
            var directive = {
                restrict: 'A',
                require: 'ngModel',
                link: {
                    pre: function(scope, element, attrs, ngModelCtrl){
                        ngModelCtrl.$parsers.push(function(timeLeft){
                            var config = scope.$eval(attrs.config);
                            var maxTime = config.max;
                            return maxTime - timeLeft;
                        });

                        ngModelCtrl.$formatters.push(function(duration){
                            var config = scope.$eval(attrs.config);
                            var maxTime = config.max;
                            return maxTime - duration;
                        });
                    }
                }
            };
            return directive;
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').service('CompleteExerciseSrv',
        ["ENV", "UserProfileService", "TeacherContextSrv", "ExerciseTypeEnum", "ExerciseResultSrv", function (ENV, UserProfileService, TeacherContextSrv, ExerciseTypeEnum, ExerciseResultSrv) {
            'ngInject';

            this.VIEW_STATES = {
                NONE: 0,
                INTRO: 1,
                EXERCISE: 2,
                SUMMARY: 3
            };

            this.getContextUid = function () {
                var isStudentApp = ENV.appContext === 'student';
                if (isStudentApp) {
                    return UserProfileService.getCurrUserId();
                } else {
                    return TeacherContextSrv.getCurrUid();
                }
            };

            this.getExerciseResult = function (exerciseDetails) {
                switch (exerciseDetails.exerciseTypeId) {
                    case ExerciseTypeEnum.LECTURE.enum:
                        return this.getContextUid().then(function (uid) {
                            return ExerciseResultSrv.getModuleExerciseResult(
                                uid,
                                exerciseDetails.parentId,
                                exerciseDetails.exerciseTypeId,
                                exerciseDetails.exerciseId
                            );
                        });
                    default:
                        return ExerciseResultSrv.getExerciseResult(
                            exerciseDetails.exerciseTypeId,
                            exerciseDetails.exerciseId,
                            exerciseDetails.exerciseParentId
                        );
                }
            };
        }]
    );
})(angular);

angular.module('znk.infra-web-app.completeExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/completeExercise/directives/completeExercise/completeExerciseDirective.template.html",
    "<div translate-namespace=\"COMPLETE_EXERCISE\">\n" +
    "    <ng-switch on=\"$ctrl.currViewState\"\n" +
    "               class=\"main-container\">\n" +
    "        <div ng-switch-when=\"1\" class=\"animate-view-state\">\n" +
    "            <complete-exercise-intro></complete-exercise-intro>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"animate-view-state\">\n" +
    "            <complete-exercise-exercise></complete-exercise-exercise>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"animate-view-state\">\n" +
    "            <complete-exercise-summary></complete-exercise-summary>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html",
    "<div class=\"base-complete-exercise-container\">\n" +
    "    <complete-exercise-header>\n" +
    "        <center-part>{{$ctrl.znkExercise.actions.getCurrentIndex() + 1}}/{{::$ctrl.znkExercise.exerciseContent.questions.length}}</center-part>\n" +
    "        <pre-right-part>\n" +
    "            <timer ng-if=\"$ctrl.timeEnabled\"\n" +
    "                   ng-model=\"$ctrl.znkExercise.exerciseResult.duration\"\n" +
    "                   complete-exercise-timer-parser\n" +
    "                   type=\"1\"\n" +
    "                   play=\"true\"\n" +
    "                   config=\"$ctrl.timerConfig\"\n" +
    "                   ng-change=\"$ctrl.durationChanged()\">\n" +
    "            </timer>\n" +
    "        </pre-right-part>\n" +
    "    </complete-exercise-header>\n" +
    "    <complete-exercise-progress-bar ng-if=\"$ctrl.timeEnabled\"\n" +
    "                                    total-time=\"{{$ctrl.znkExercise.exerciseContent.time}}\"\n" +
    "                                    duration=\"$ctrl.znkExercise.exerciseResult.duration\">\n" +
    "    </complete-exercise-progress-bar>\n" +
    "    <znk-exercise questions=\"$ctrl.znkExercise.exerciseContent.questions\"\n" +
    "                  ng-model=\"$ctrl.znkExercise.exerciseResult.questionsResult\"\n" +
    "                  settings=\"$ctrl.znkExercise.settings\"\n" +
    "                  actions=\"$ctrl.znkExercise.actions\">\n" +
    "    </znk-exercise>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseHeader/completeExerciseHeaderDirective.template.html",
    "<div class=\"header-container\"\n" +
    "     translate-namespace=\"COMPLETE_EXERCISE\"\n" +
    "     subject-id-to-attr-drv=\"$ctrl.exerciseContent.subjectId\"\n" +
    "     context-attr=\"class,class\"\n" +
    "     suffix=\"bg,subject-pattern\">\n" +
    "    <div class=\"left-part\">\n" +
    "        <div class=\"left-title\" ng-bind=\"$ctrl.leftTitle\" title=\"{{$ctrl.leftTitle}}\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"center-part\">\n" +
    "        <div ng-transclude=\"centerPart\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"right-part\">\n" +
    "        <div ng-transclude=\"preRightPart\"></div>\n" +
    "        <div class=\"exit\"\n" +
    "             translate=\".EXIT\"\n" +
    "             ng-click=\"$ctrl.completeExerciseCtrl.settings.exitAction()\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntro/completeExerciseIntroDirective.template.html",
    "<div class=\"base-complete-exercise-container\">\n" +
    "    <complete-exercise-header></complete-exercise-header>\n" +
    "    <ng-switch on=\"$ctrl.exerciseTypeId\" class=\"intro-container\">\n" +
    "        <complete-exercise-intro-tutorial ng-switch-when=\"1\">\n" +
    "        </complete-exercise-intro-tutorial>\n" +
    "        <complete-exercise-intro-section ng-switch-when=\"4\">\n" +
    "        </complete-exercise-intro-section>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSectionDirective.template.html",
    "<div class=\"intro-container\"\n" +
    "     translate-namespace=\"COMPLETE_EXERCISE\">\n" +
    "    <div class=\"title\" ng-bind=\"$ctrl.exerciseParentContent.name\"></div>\n" +
    "    <svg-icon subject-id-to-attr-drv=\"$ctrl.exerciseContent.subjectId\"\n" +
    "              context-attr=\"name\"\n" +
    "              suffix=\"icon\"\n" +
    "              class=\"subject-icon\">\n" +
    "    </svg-icon>\n" +
    "    <div class=\"subject-text\"\n" +
    "         translate=\"SUBJECTS.{{$ctrl.exerciseContent.subjectId}}\">\n" +
    "    </div>\n" +
    "    <div class=\"section-data\">\n" +
    "        <span translate=\".QUESTIONS\"\n" +
    "              translate-values=\"{num: $ctrl.exerciseContent.questions.length}\">\n" +
    "        </span>\n" +
    "        <span translate=\".TIME\"\n" +
    "              translate-values=\"$ctrl.timeTranslateValue\">\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"instructions-title\"\n" +
    "         translate=\".INSTRUCTIONS\">\n" +
    "    </div>\n" +
    "    <p class=\"instructions-text\"\n" +
    "       translate=\"SECTION_INSTRUCTION.{{$ctrl.exerciseContent.subjectId}}\">\n" +
    "    </p>\n" +
    "    <div class=\"btn-section\">\n" +
    "        <md-button class=\"md-primary znk\"\n" +
    "                   md-no-ink\n" +
    "                   translate=\".START\"\n" +
    "                   ng-click=\"$ctrl.start()\">\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntroTutorial/completeExerciseIntroTutorialDirective.template.html",
    "<div class=\"intro-container\">\n" +
    "    <div class=\"video-wrapper\">\n" +
    "        <video controls\n" +
    "               video-ctrl-drv\n" +
    "               on-play=\"vm.onVideoPlay()\"\n" +
    "               on-ended=\"vm.onVideoEnded()\"\n" +
    "               video-error-poster=\"assets/images/video-is-not-available-img.png\">\n" +
    "            <source ng-src=\"{{::$ctrl.videoSrc}}\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "    </div>\n" +
    "    <div class=\"content-wrapper\">\n" +
    "        <div ng-repeat=\"content in $ctrl.exerciseContent.content\">\n" +
    "            <div ng-bind-html=\"::$ctrl.trustAsHtml(content.title)\"></div>\n" +
    "            <div ng-bind-html=\"::$ctrl.trustAsHtml(content.body)\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"btn-section\">\n" +
    "        <md-button class=\"md-primary znk go-to-questions-btn\"\n" +
    "                   md-no-ink\n" +
    "                   translate=\".GO_QST\"\n" +
    "                   ng-click=\"$ctrl.goToQuestions()\">\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseProgressBar/completeExerciseProgressBarDirective.template.html",
    "<div class=\"progress-bar\"></div>\n" +
    "\n" +
    "");
}]);