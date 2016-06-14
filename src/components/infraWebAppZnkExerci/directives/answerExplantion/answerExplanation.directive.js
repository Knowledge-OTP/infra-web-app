(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(function(SvgIconSrvProvider){
            'ngInject';
             
            var svgMap = {
                'workouts-roadmap-checkmark': 'components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg',
                'workouts-roadmap-change-subject': 'components/workoutsRoadmap/svg/change-subject-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        })
        .directive('answerExplanation',
        function ($translatePartialLoader, ZnkExerciseViewModeEnum, $compile, $filter, $sce, ENV, znkAnalyticsSrv) {
            'ngInject';

            var directive = {
                scope: {},
                require: ['^questionBuilder', '^ngModel'],
                templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplantion/answerExplanation.template.html',
                link: function link(scope, element, attrs, ctrls) {
                    $translatePartialLoader.addPart('infraWebAppZnkExercise');

                    var questionBuilderCtrl = ctrls[0];
                    var ngModelCtrl = ctrls[1];

                    scope.d = {};
                    var domElem = element[0];
                    var viewMode = questionBuilderCtrl.getViewMode();
                    var question = questionBuilderCtrl.question;
                    var isPlayFlag = false;

                    function addWrittenSolutionText() {
                        var answerExplantionWrapperElem = angular.element(domElem.querySelector('.answer-explanation-wrapper'));
                        var writtenSlnContent = questionBuilderCtrl.question.writtenSln;
                        var answerExplantionElem = angular.element(
                            '<div ng-if="d.toggleWrittenSln" class="answer-explanation-window znk-scrollbar">' +
                            '<div class="title">' +
                            '{{d.answerExplanationTitle}}' +
                            '<div class="answer-explanation-close">' +
                            '<svg-icon name="close-popup" ng-click="d.close()"></svg-icon>' +
                            '</div>' +
                            '</div>' +
                            '<div class="flex-wrap">' +
                            '<div class="video-wrap">' +
                            '<video ' +
                            'controls ' +
                            'video-ctrl-drv ' +
                            'on-play="d.onVideoPlay()" ' +
                            'on-ended="d.onVideoEnded()" ' +
                            'video-error-poster="assets/images/raccoon/video-is-not-available-img.png">' +
                            '<source ng-src="{{::d.videoSrc}}" type="video/mp4">' +
                            '</video>' +
                            '<div class="question-quid-text">{{::d.quid}}</div>' +
                            '</div>' +
                            '<div class="written-solution-wrapper">' + writtenSlnContent + '</div>' +
                            '</div>' +
                            '</div>'
                        );
                        answerExplantionWrapperElem.prepend(answerExplantionElem);
                        $compile(answerExplantionElem)(scope);
                    }

                    function _getPropsForAnalytics() {
                        return {
                            subjectType: question.subjectId,
                            questionId: question.id
                        };
                    }

                    function _saveAnalytics() {
                        if (scope.d.toggleWrittenSln) {
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'writtenSolutionClicked',
                                props: _getPropsForAnalytics()
                            });
                            znkAnalyticsSrv.timeTrack({eventName: 'writtenSolutionClosed'});
                        } else {
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'writtenSolutionClosed',
                                props: _getPropsForAnalytics()
                            });
                        }
                    }

                    function viewChangeListener() {
                        if (ngModelCtrl.$viewValue) {           // user already answered
                            domElem.style.display = 'block';
                            addWrittenSolutionText();
                        } else {
                            ngModelCtrl.$viewChangeListeners.push(function () {
                                domElem.style.display = 'block';
                                addWrittenSolutionText();
                            });
                        }
                    }

                    switch (viewMode) {
                        case ZnkExerciseViewModeEnum.REVIEW.enum:
                            addWrittenSolutionText();
                            break;
                        case ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum:
                            // domElem.style.display = 'none';todo
                            viewChangeListener();
                            break;
                        default:
                            // domElem.style.display = 'none'; todo
                    }

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.videosEndPoint + 'videos/' + 'questions' + '/' + questionBuilderCtrl.question.id + '.mp4');

                    scope.d.answerExplanationTitle = $filter('translate')('ANSWER_EXPLANATION.TITLE');

                    scope.d.quid = question.quid || question.id;

                    scope.d.onVideoEnded = function () {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'videoClosed',
                            props: _getPropsForAnalytics()
                        });
                    };

                    scope.d.onVideoPlay = function () {
                        if (!isPlayFlag) {
                            isPlayFlag = true;
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'videoClicked',
                                props: _getPropsForAnalytics()
                            });
                            znkAnalyticsSrv.timeTrack({eventName: 'videoClosed'});
                        }
                    };

                    scope.d.close = () => {
                        scope.d.toggleWrittenSln = false;
                        _saveAnalytics();
                    };

                    scope.d.saveAnalytics = () => {
                        _saveAnalytics();
                    };
                }
            };
            return directive;
        });
})(angular);
