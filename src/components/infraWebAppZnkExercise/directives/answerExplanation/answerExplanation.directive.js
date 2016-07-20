(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'answer-explanation-lamp-icon': 'components/infraWebAppZnkExercise/svg/lamp-icon.svg',
                'answer-explanation-close': 'components/infraWebAppZnkExercise/svg/close.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        })
        .directive('answerExplanation',
            function ($translatePartialLoader, ZnkExerciseViewModeEnum, znkAnalyticsSrv, $timeout) {
                'ngInject';

                var directive = {
                    scope: {},
                    require: ['^questionBuilder', '^ngModel'],
                    templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html',
                    link: function link(scope, element, attrs, ctrls) {
                        $translatePartialLoader.addPart('infraWebAppZnkExercise');

                        var questionBuilderCtrl = ctrls[0];
                        var ngModelCtrl = ctrls[1];
                        var viewMode = questionBuilderCtrl.getViewMode();
                        var question = questionBuilderCtrl.question;

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
                                    subjectType: question.subjectId,
                                    questionId: question.id
                                };

                                scope.$watch('d.showWrittenSln', function (isVisible) {
                                    if (isVisible || isVisible === false) {
                                        if (isVisible) {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClicked',
                                                props: analyticsProps
                                            });
                                            znkAnalyticsSrv.timeTrack({eventName: 'writtenSolutionClosed'});
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
                                ngModelCtrl.$viewChangeListeners.push(function () {
                                    init();
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
                    }
                };
                return directive;
            }
        );
})(angular);
