(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').provider('ExerciseCycleSrv',
        function () {
            var hooksObj = {};

            this.extendHooks = function (_hooksObj) {
                hooksObj = _hooksObj;
            };

            this.$get = function ($log) {
                'ngInject';
                var exerciseCycleSrv = {};

                exerciseCycleSrv.getHook = function (key) {    
                    if (hooksObj && hooksObj[key]) {
                       return exerciseCycleSrv.invoke.bind(null, key);
                    }
                    return { invoke: angular.noop };
                };

                exerciseCycleSrv.invoke = function (key, methodName, data) {                    
                    var hook = hooksObj[key];
                    var method = hook[methodName];

                    if (angular.isFunction(method)) {
                        data = angular.isArray(data) ? data : [data];
                        return method.apply(null, data);
                    } 

                    $log.error('exerciseCycleSrv invoke: method is not a function! method: ' + methodName);
                };

                return exerciseCycleSrv;
            };
        }
    );
})(angular);
