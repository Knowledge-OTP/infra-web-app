(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'answer-explanation-lamp-icon': 'components/infraWebAppZnkExercise/svg/lamp-icon.svg',
                'answer-explanation-close': 'components/infraWebAppZnkExercise/svg/answer-explanation-close.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        })
        .directive('answerExplanation',
        function (ZnkExerciseViewModeEnum, znkAnalyticsSrv, $timeout, CategoryService) {
            'ngInject';

            var directive = {
                scope: {},
                require: ['^questionBuilder', '^ngModel'],
                templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html',
                link: function link(scope, element, attrs, ctrls) {

                    var questionBuilderCtrl = ctrls[0];
                    var ngModelCtrl = ctrls[1];
                    var viewMode = questionBuilderCtrl.getViewMode();
                    var question = questionBuilderCtrl.question;
                    var questionSubjectId = (typeof question.subjectId === 'undefined' || question.subjectId === null) ?
                        CategoryService.getCategoryLevel1ParentSync([question.categoryId, question.categoryId]) : question.subjectId;

                    scope.d = {};

                    var init = (function () {
                        var wasInit;

                        return function () {
                            if (wasInit) {
                                return;
                            }

                            // add timeout to prevent showing visible answer explanation for a
                            // second before it's hidden on slide that is not the current slide
                            // (because the slider shifts from first slide to current)
                            $timeout(function () {
                                element.addClass('answer-explanation-visible');
                            }, 0, false);

                            var analyticsProps = {
                                subjectType: questionSubjectId,
                                questionId: question.id
                            };

                            scope.$watch('d.showWrittenSln', function (isVisible) {
                                if (isVisible || isVisible === false) {
                                    if (isVisible) {
                                        znkAnalyticsSrv.eventTrack({
                                            eventName: 'writtenSolutionClicked',
                                            props: analyticsProps
                                        });
                                        znkAnalyticsSrv.timeTrack({ eventName: 'writtenSolutionClosed' });
                                    } else {
                                        znkAnalyticsSrv.eventTrack({
                                            eventName: 'writtenSolutionClosed',
                                            props: analyticsProps
                                        });
                                    }
                                }
                            });

                            wasInit = true;
                        };
                    })();

                    function viewChangeListener() {
                        if (ngModelCtrl.$viewValue) {           // user already answered
                            init();
                        } else {
                            // $watch seems to work for sharer and viewer, while $viewChangeListeners
                            // worked only for sharer. it's because $viewChangeListeners does not
                            // invoke when the $modalValue change, only when the $viewValue (via input and etc)
                            scope.$watch(function () {
                                return ngModelCtrl.$viewValue;
                            }, function (newVal) {
                                // newVal undefined meens no answer yet, so must be protected
                                if (angular.isDefined(newVal)) {
                                    init();
                                }
                            });
                        }
                    }

                    switch (viewMode) {
                        case ZnkExerciseViewModeEnum.REVIEW.enum:
                            init();
                            break;
                        case ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum:
                            viewChangeListener();
                            break;
                    }

                    function _updateBindExercise() {
                        questionBuilderCtrl.bindExerciseEventManager.update('answerExplanation', { data: scope.d.toggleWrittenSln, update: true }, question.id);
                    }

                    scope.d.close = function () {
                        scope.d.toggleWrittenSln = false;
                        questionBuilderCtrl.updateAnswerExplnView(scope.d.toggleWrittenSln);
                        _updateBindExercise();
                    };

                    scope.d.toggleAnswer = function () {
                        scope.d.toggleWrittenSln = !scope.d.toggleWrittenSln;
                        questionBuilderCtrl.updateAnswerExplnView(scope.d.toggleWrittenSln);
                        _updateBindExercise();
                    };

                    questionBuilderCtrl.bindExerciseEventManager.registerCb('answerExplanation', function (newVal) {
                        scope.d.toggleWrittenSln = newVal.data;
                    }, question.id);
                }
            };
            return directive;
        }
        );
})(angular);
