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
        });
})(angular);
