(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').provider('EvaluateSrv',
        function() {

        var _evaluateResultByType;

        this.setEvaluateResultByType = function(evaluateResultByType) {
            _evaluateResultByType = evaluateResultByType;
        };

        this.$get = function($q, $injector, $log) {
            'ngInject';

            var evaluateSrvApi = {};

            evaluateSrvApi.getEvaluateResultByType = function() {

                if(!_evaluateResultByType) {
                    var errMsg = 'EvaluateSrv: evaluateResultByType was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return $q.when($injector.invoke(_evaluateResultByType));
            };

            return evaluateSrvApi;

        };
    });
})(angular);
