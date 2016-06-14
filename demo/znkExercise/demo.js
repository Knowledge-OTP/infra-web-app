(function (angular) {
    'use strict';

    angular.module('demo', [
        'znk.infra-web-app.znkExercise',
        'ngAnimate'
    ])
        .config(function (QuestionTypesSrvProvider, $sceProvider) {
            $sceProvider.enabled(false);

            var map = {
                1: '<div>question Type 1</div><span>{{$parent.questionGetter().id}}</span>' +
                '<div ng-bind-html="$parent.questionGetter().content"></div>' +
                '<answer-builder></answer-builder>',
                2: '<div>question Type 2</div><span>{{$parent.questionGetter().id}}</span>',
                3: '<div>question Type 3</div><span>{{$parent.questionGetter().id}}</span>'
            };
            QuestionTypesSrvProvider.setQuestionTypesHtmlTemplate(map);

            function questionTypeGetter(question) {
                return (question.id % 3) + 1;
            }

            QuestionTypesSrvProvider.setQuestionTypeGetter(questionTypeGetter);
        })
        .controller('Main', function ($scope, $timeout, BaseExerciseGetterSrv, ExerciseTypeEnum) {
            $scope.d = {};

            $scope.d.settings = {
                viewMode: 1,
                allowedTimeForExercise: 10000
            };

            function rebuildExercise() {
                $scope.d.hideExercise = true;
                $timeout(function () {
                    $scope.d.hideExercise  = false;
                });
            }

            BaseExerciseGetterSrv.getExerciseByNameAndId(103, 'practice').then(function(practice){
                $scope.d.questions = practice.questions;
                rebuildExercise();
            });

            $scope.setViewMode = function (viewMode) {
                $scope.settings.viewMode = viewMode;
                rebuildExercise();
            };

            $scope.showOrHidePager = function () {
                $scope.settings.initPagerDisplay = !$scope.settings.initPagerDisplay;
                $scope.d.actions.pagerDisplay($scope.settings.initPagerDisplay);
            };

            $scope.showOrHideDoneBtn = function () {
                $scope.settings.initForceDoneBtnDisplay = !$scope.settings.initForceDoneBtnDisplay;
                $scope.d.actions.forceDoneBtnDisplay($scope.settings.initForceDoneBtnDisplay);
            };
        });

})(angular);
