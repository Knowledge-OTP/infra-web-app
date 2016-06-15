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
                scope: {
                    onClose: '&'
                },
                link: function (scope, element, attrs, questionBuilderCtrl) {
                    var question = questionBuilderCtrl.question;
                    var isPlayFlag = false;
                    var analyticsProps = {
                        subjectType: question.subjectId,
                        questionId: question.id
                    };

                    scope.d = {};

                    var writtenSlnContent = questionBuilderCtrl.question.writtenSln &&
                        questionBuilderCtrl.question.writtenSln.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                    scope.d.writtenSlnContent = writtenSlnContent;

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.videosEndPoint + '/videos/' + 'questions' + '/' + question.id + '.mp4');

                    scope.d.quid = question.quid || question.id;

                    scope.d.onVideoEnded = function () {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'videoClosed',
                            props: analyticsProps
                        });
                    };

                    scope.d.onVideoPlay = function () {
                        if (!isPlayFlag) {
                            isPlayFlag = true;
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'videoClicked',
                                props: analyticsProps
                            });
                            znkAnalyticsSrv.timeTrack({eventName: 'videoClosed'});
                        }
                    };

                    scope.d.close = function () {
                        scope.onClose();
                    };
                }
            };
        }
    );
})(angular);

