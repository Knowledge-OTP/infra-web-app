(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').provider('ExerciseCycleSrv',
        function () {
            var hooksObj = {};

            this.setInvokeFunctions = function (_hooksObj) {
                hooksObj = _hooksObj;
            };

            this.$get = function ($log, $injector) {
                'ngInject';
                var exerciseCycleSrv = {};

                exerciseCycleSrv.invoke = function (methodName, data) {                    
                    var method = hooksObj[methodName];
                    var fn;

                    if (angular.isFunction(method)) {
                        data = angular.isArray(data) ? data : [data];
                          
                        try {
                            fn = $injector.invoke(method);         
                        } catch(e) {
                            $log.error('exerciseCycleSrv invoke: faild to invoke method! methodName: ' + methodName);
                            return;
                        }

                        return fn.apply(null, data);
                    } 
                };

                return exerciseCycleSrv;
            };
        }
    );
})(angular);
