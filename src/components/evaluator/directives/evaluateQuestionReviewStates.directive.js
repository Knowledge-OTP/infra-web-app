/**
 * evaluateQuestionReviewStates
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
    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionReviewStates', {
            require: {
                parent: '?^ngModel'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionReviewStates.template.html',
            controllerAs: 'vm',
            controller: function () {
                var vm = this;

                vm.$onInit = function() {
                    var ngModelCtrl = vm.parent;
                    if (ngModelCtrl) {
                        ngModelCtrl.$render = function() {
                            vm.stateData = ngModelCtrl.$modelValue;
                        };
                    }
                };

            }
        }
    );
})(angular);
