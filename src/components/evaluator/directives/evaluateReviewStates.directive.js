(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').directive('evaluateReviewStates',
        function(){
        'ngInject';
        return {
            scope: {},
            restrict: 'E',
            templateUrl: 'components/evaluator/templates/evaluateReviewStates.template.html',
            link: function (scope) {
                var stateStatusEnum = {
                   notPurchase: 1,
                   pending: 2,
                   evaluated: 3
                };
                scope.stateStatus = stateStatusEnum.evaluated;
            }
        };
    });
})(angular);
