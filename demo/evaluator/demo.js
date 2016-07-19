(function(angular) {

    var isPro = true;

    angular.module('demo', ['znk.infra-web-app.evaluator']).config(function($translateProvider) {
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
        .service('purchaseService', function($q) { // mock for purchaseService
            this.hasProVersion = function() {
                return $q.when(isPro);
            };
        })
        .controller('Main', function ($scope, $translatePartialLoader) {

            $translatePartialLoader.addPart('demo');

            function getRandom() {
                return Math.floor(Math.random()*(2-1+1)+1);
            }

            $scope.changeToPending = function() {
                isPro = true;
                $scope.stateData = {
                    typeId: getRandom() === 1 ? 2 : 4,
                    userAnswer: getRandom() === 1 ? true : 1
                };
            };

            $scope.changeToNotPurchase = function() {
                isPro = false;
                $scope.stateData = {
                    typeId: getRandom() === 1 ? 2 : 4,
                    userAnswer: getRandom() === 1 ? true : 1
                };
            };

            $scope.changeToEvaluated = function() {
                isPro = true;
                $scope.stateData = {
                    typeId: getRandom() === 1 ? 2 : 4,
                    userAnswer: getRandom() === 1 ? true : 1,
                    points: getRandom() === 1 ? '2.5' : '3.5'
                };
            };

            $scope.changeToNotPurchase();
        });
})(angular);
