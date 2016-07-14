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
            controller: function ($translatePartialLoader, ZnkEvaluateResultSrv) {
                var vm = this;

                $translatePartialLoader.addPart('evaluator');

                vm.$onInit = function() {
                    var ngModelCtrl = vm.parent;

                    if (ngModelCtrl) {

                        ngModelCtrl.$render = function() {
                            vm.stateData = ngModelCtrl.$modelValue;
                        };

                        ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                             vm.evaluateTypes = types;
                        });
                    }
                };

            }
        }
    );
})(angular);
