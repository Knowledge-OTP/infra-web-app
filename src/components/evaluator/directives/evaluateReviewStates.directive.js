/**
 * evaluateReviewStates
 *  ng-model: gets an object with activeState:Number(from EvaluatorStatesEnum)
 *  and for evaluated state add points and type props for evaluate-result drv like:
 *  {
        activeState: EvaluatorStatesEnum.EVALUATED.enum,
        points: 2.5,
        type: 2
    }
 */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').directive('evaluateReviewStates',
        function() {
        'ngInject';
        return {
            scope: {},
            restrict: 'E',
            require: '?ngModel',
            templateUrl: 'components/evaluator/templates/evaluateReviewStates.template.html',
            link: function (scope, element, attr, ngModelCtrl) {
                if (ngModelCtrl) {
                    ngModelCtrl.$render = function() {
                        scope.stateData = ngModelCtrl.$modelValue;
                    };
                }
            }
        };
    });
})(angular);
