/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('answerExplanationContent',
        function (ENV, $sce, znkAnalyticsSrv, CategoryService) {
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
                    var questionCategoryForSubjectId = question.categoryId || question.categoryId2;
                    var questionSubjectId = CategoryService.getCategoryLevel1ParentByIdSync(questionCategoryForSubjectId);
                    var isPlayFlag = false;
                    var analyticsProps = {
                        subjectType: questionSubjectId,
                        questionId: question.id
                    };

                    scope.d = {};

                    var writtenSlnContent = questionBuilderCtrl.question.writtenSln &&
                        questionBuilderCtrl.question.writtenSln.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                    scope.d.writtenSlnContent = $sce.trustAsHtml(writtenSlnContent);

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.mediaEndPoint + ENV.firebaseAppScopeName + '/videos/questions' + '/' + question.id + '.mp4');

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

