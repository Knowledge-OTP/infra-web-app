(function(angular) {

    angular.module('demo', ['znk.infra-web-app.znkSummary']).config(function($translateProvider) {
            $translateProvider.useLoader('$translatePartialLoader', {
                    urlTemplate: '/{part}/locale/{lang}.json'
                })
                .preferredLanguage('en');
        })
        .run(function ($rootScope, $translate) {
            $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                $translate.refresh();
            });
        })
        .controller('Main', function ($scope) {

            $scope.exerciseResult = {
                correctAnswersNum: 15,
                correctAvgTime: 620,
                skippedAnswersNum: 0,
                skippedAvgTime: 0,
                wrongAnswersNum: 25,
                wrongAvgTime: 892
            };

            $scope.exerciseData = {
                exerciseResult: {
                    seenSummary: false
                },
                exercise: {
                    subjectId: 0 // math
                }
            };

        }).decorator('EstimatedScoreSrv', function($delegate) {
            var decoratedEstimatedScoreSrv = $delegate;

            var getEstimatedScoresFn = $delegate.getEstimatedScores;

            decoratedEstimatedScoreSrv.getEstimatedScoresData = function () {
                return getEstimatedScoresFn.apply($delegate).then(function (estimatedScoresData) {
                    var estimatedScores = {};
                    angular.forEach(estimatedScoresData, function (estimatedScore, subjectId) {
                        estimatedScores[subjectId] = [];
                        angular.forEach(estimatedScore, function (value) {
                            value.score = Math.round(value.score) || 0;
                            estimatedScores[subjectId].push(value);
                        });
                    });
                    return estimatedScores;
                });
            };

            return decoratedEstimatedScoreSrv;
         });
})(angular);
