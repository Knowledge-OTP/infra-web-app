angular.module('demo', ['znk.infra-web-app.evaluator']).config(function($translateProvider, ZnkEvaluateResultSrvProvider) {
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
.controller('Main', function ($scope, EvaluatorStatesEnum, $translatePartialLoader) {

    $translatePartialLoader.addPart('demo');

    function getRandom() {
       return Math.floor(Math.random()*(2-1+1)+1);
    }

    $scope.changeToPending = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.PENDING.enum,
            type: getRandom() === 1 ? 2 : 4
        };
    };

    $scope.changeToNotPurchase = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.NOT_PURCHASE.enum,
            type: getRandom() === 1 ? 2 : 4
        };
    };

    $scope.changeToEvaluated = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.EVALUATED.enum,
            points: 2.5,
            type: getRandom() === 1 ? 2 : 4
        };
    };

    $scope.changeToEvaluated();

});
