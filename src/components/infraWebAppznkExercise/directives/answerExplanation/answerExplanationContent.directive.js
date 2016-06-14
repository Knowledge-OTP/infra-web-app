/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('answerExplanationContent',
        function (ENV, $sce, znkAnalyticsSrv) {
            'ngInject';

            return {
                templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html',
                require: '^questionBuilder',
                restrict: 'E',
                scope: {},
                link: function (scope, element, attrs, questionBuilderCtrl) {
                    var question = questionBuilderCtrl.question;
                    var isPlayFlag = false;

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
                    
                    var writtenSlnContent = questionBuilderCtrl.question.writtenSln &&
                        questionBuilderCtrl.question.writtenSln.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                    scope.d = {
                        writtenSlnContent: writtenSlnContent
                    };

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.videosEndPoint + '/videos/' + 'questions' + '/' + question.id + '.mp4');

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

                    scope.d.close = function () {
                        scope.d.toggleWrittenSln = false;
                        _saveAnalytics();
                    };
                }
            };
        }
    );
})(angular);

