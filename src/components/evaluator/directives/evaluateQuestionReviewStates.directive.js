/**
 * evaluateQuestionReviewStates
 *  ng-model: gets an object with typeId
 *  and for evaluated state add points prop for evaluate-result drv like:
 *  {
        points: 2.5,
        typeId: 2,
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
            controller: function ($translatePartialLoader, ZnkEvaluatorSrv, ZnkEvaluateResultSrv) {
                var vm = this;

                $translatePartialLoader.addPart('evaluator');

                function _changeEvaluateStatus(stateData) {
                    var evaluateStatusFnProm = ZnkEvaluatorSrv.getEvaluateStatusFn();
                    evaluateStatusFnProm(stateData).then(function(state) {
                        vm.evaluateStatus = state;
                    });
                }

                vm.$onInit = function() {
                    var ngModelCtrl = vm.parent;

                    if (ngModelCtrl) {

                        ngModelCtrl.$render = function() {
                            vm.stateData = ngModelCtrl.$modelValue;
                            _changeEvaluateStatus(vm.stateData);
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
