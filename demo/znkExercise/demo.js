(function (angular) {
    'use strict';

    angular.module('demo', [
        'znk.infra-web-app.znkExerciseStates',
        'znk.infra.exerciseUtility',
        'znk.infra.exerciseResult',
        // 'znk.infra-web-app.infraWebAppZnkExercise',
        // 'ngAnimate',
        // 'pascalprecht.translate',
        'znk.infra.exerciseDataGetters'
    ])
        .config(function ($translateProvider, QuestionTypesSrvProvider, $sceProvider) {
            'ngInject';
            $translateProvider.preferredLanguage('en');
            $translateProvider.useSanitizeValueStrategy(null);

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
        .config(function ($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('exerciseRouter');

            $stateProvider
                .state('exerciseRouter', {
                    url: '/exerciseRouter',
                    template: '<ui-view></ui-view>',
                    controller: function (exerciseData, exerciseResult, exercise) {
                        // debugger;
                        exerciseData.exerciseResult = exerciseResult;
                        exerciseData.exercise = exercise;
                        exerciseData.headerTitle = 'Demo Title';
                        exerciseData.headerExitAction = function(){
                            alert('Exit pressed');
                        };
                    },
                    resolve: {
                        exerciseData:function () {
                            return {};
                        },
                        exerciseResult:function(ExerciseResultSrv, ExerciseTypeEnum){
                            return ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.PRACTICE.enum, 103);
                        },
                        exercise: function(BaseExerciseGetterSrv){
                            return BaseExerciseGetterSrv.getExerciseByNameAndId(103, 'practice');
                        }
                    }
                })
                .state('exerciseRouter.exercise', {
                    url: '/exercise',
                    templateUrl: 'components/znkExerciseStates/templates/exercise.template.html',
                    controller: 'InfraWebAppExerciseStateCtrl'
                });
        })
        .controller('MainCtrl', function (/*$scope, $timeout, BaseExerciseGetterSrv*/) {
            // $scope.d = {};
            //
            // $scope.d.settings = {
            //     viewMode: 3,
            //     allowedTimeForExercise: 10000
            // };
            //
            // function rebuildExercise() {
            //     $scope.d.hideExercise = true;
            //     $timeout(function () {
            //         $scope.d.hideExercise  = false;
            //     });
            // }
            //
            // BaseExerciseGetterSrv.getExerciseByNameAndId(103, 'practice').then(function(practice){
            //     $scope.d.questions = practice.questions;
            //     rebuildExercise();
            // });
            //
            // $scope.setViewMode = function (viewMode) {
            //     $scope.settings.viewMode = viewMode;
            //     rebuildExercise();
            // };
            //
            // $scope.showOrHidePager = function () {
            //     $scope.settings.initPagerDisplay = !$scope.settings.initPagerDisplay;
            //     $scope.d.actions.pagerDisplay($scope.settings.initPagerDisplay);
            // };
            //
            // $scope.showOrHideDoneBtn = function () {
            //     $scope.settings.initForceDoneBtnDisplay = !$scope.settings.initForceDoneBtnDisplay;
            //     $scope.d.actions.forceDoneBtnDisplay($scope.settings.initForceDoneBtnDisplay);
            // };
        });

})(angular);
