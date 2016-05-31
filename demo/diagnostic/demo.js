angular.module('demo', [
        'znk.infra-web-app.diagnostic',
        'pascalprecht.translate'])
    .config(function ($translateProvider, StatsSrvProvider, $urlRouterProvider, InfraConfigSrvProvider, UserGoalsServiceProvider, DiagnosticIntroSrvProvider, SvgIconSrvProvider, QuestionTypesSrvProvider, WorkoutsDiagnosticFlowProvider) {

        var svgMap = {
            'math-section-icon': 'svg/math-section-icon.svg',
            'verbal-icon': 'svg/verbal-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);

        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en');

        var getCategoryFn = function ($q) {
            return $q.when({});
        };

        StatsSrvProvider.setCategoryLookup(getCategoryFn);

        InfraConfigSrvProvider.setUserDataFn(['AuthService', function (AuthService) {
            return AuthService.getAuth();
        }]);

        UserGoalsServiceProvider.settings = {
            defaultSubjectScore: 600,
            minSchoolScore: 400,
            maxSchoolScore: 1600,
            minGoalsScore: 200,
            maxGoalsScore: 800,
            updateGoalNum: 10,
            subjects: [
                { name: 'math', svgIcon: 'math-section-icon' },
                { name: 'verbal', svgIcon: 'verbal-icon' }
            ]
        };

        DiagnosticIntroSrvProvider.setConfigGetter(['ENV', function (ENV) {
            return {
                subjects: [
                    {
                        id: ENV.MATH,
                        subjectNameAlias: 'math',
                        subjectIconName: 'math-section-icon'
                    },
                    {
                        id: ENV.VERBAL,
                        subjectNameAlias: 'verbal',
                        subjectIconName: 'math-section-icon'
                    },
                    {
                        id: ENV.READING,
                        subjectNameAlias: 'reading',
                        subjectIconName: 'math-section-icon'
                    },
                    {
                        id: ENV.SCIENCE,
                        subjectNameAlias: 'science',
                        subjectIconName: 'math-section-icon'
                    }
                ],
                all: {
                    subjectNameAlias: 'all',
                    hideSectionQuestion: true
                },
                none: {
                    subjectNameAlias: 'none',
                    hideSectionQuestion: true
                }
            };
        }]);

        DiagnosticIntroSrvProvider.setActiveSubjectGetter(['ENV', function (ENV) {
            return {id: ENV.VERBAL};
        }]);

        WorkoutsDiagnosticFlowProvider.setDiagnosticSettings({
            diagnosticId: 14,
            summary: {
                subjects: [
                    {
                        id: 0,
                        name: 'math',
                        colors: ['#75cbe8', '#c9c9c9', '#f3f3f3']
                    },
                    {
                        id: 7,
                        name: 'verbal',
                        colors: ['#f9d628', '#c9c9c9', '#f3f3f3']
                    }
                ]
            }
        });


            function questionTypeGetter(question) {
                var templatesContants = {
                    SIMPLE_QUESTION: 0
                };
                return templatesContants.SIMPLE_QUESTION;
            }

            QuestionTypesSrvProvider.setQuestionTypeGetter(questionTypeGetter);

            var map = {
                0: '<simple-question></simple-question>'
            };

            QuestionTypesSrvProvider.setQuestionTypesHtmlTemplate(map);

        $urlRouterProvider.otherwise('/diagnostic');
    })
    .run(function ($rootScope, $translate, $translatePartialLoader) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
        $translatePartialLoader.addPart('demo');
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    })// mock ENV
    .service('ENV', function () {
        this.MATH = 0; // mock subject id from enum
        this.VERBAL = 8;
        this.READING = 10;
        this.SCIENCE = 2;
        this.ALL = 'all';
        this.NONE = 'none';
    }).directive('simpleQuestion', function() {
        function compileFn() {
            function preFn(scope, element, attrs, questionBuilderCtrl) {
                var content = questionBuilderCtrl.question.content.replace(/_/g, '');
                var questionContentElement = angular.element(element[0].querySelector('.question-content'));
                questionContentElement.append(content);
            }

            return {
                pre: preFn
            };
        }

        return {
            templateUrl: 'templates/simpleQuestion.html',
            restrict: 'E',
            require: '^questionBuilder',
            scope: {},
            compile: compileFn
        };
    }).directive('customAnswerBuilderSat', function(ZnkExerciseViewModeEnum, AnswerTypeEnum) {
        function compileFn() {
            function preFn(scope, element, attrs, ctrls) {
                var questionBuilderCtrl = ctrls[0];
                var ngModelCtrl = ctrls[1];
                var viewMode = questionBuilderCtrl.getViewMode();
                var question = questionBuilderCtrl.question;

                scope.d = {};
                var isFreeTextAnswer = question.answerTypeId === AnswerTypeEnum.FREE_TEXT_ANSWER.enum;
                var isAnswerWithResultMode = viewMode === ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum;
                var isReviewMode = viewMode === ZnkExerciseViewModeEnum.REVIEW.enum;
                var isUserNotAnswered = angular.isUndefined(ngModelCtrl.$viewValue);
                if (isFreeTextAnswer && isUserNotAnswered && !isReviewMode) {
                    scope.d.showFreeTextInstructions = true;
                    if (isAnswerWithResultMode) {
                        ngModelCtrl.$viewChangeListeners.push(function () {
                            scope.d.showFreeTextInstructions = false;
                        });
                    }
                }
            }

            return {
                pre: preFn
            };
        }

        return {
            templateUrl: 'templates/customAnswerBuilderSat.html',
            restrict: 'E',
            require: ['^questionBuilder', '^ngModel'],
            scope: {},
            compile: compileFn
        };

    });
