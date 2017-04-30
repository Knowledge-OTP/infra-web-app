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
                    var hook = hooksObj[methodName];
                    var fn;

                    if (angular.isDefined(hook)) {                      
                        try {
                            fn = $injector.invoke(hook);         
                        } catch(e) {
                            $log.error('exerciseCycleSrv invoke: faild to invoke hook! methodName: ' + methodName + 'e: '+ e);
                            return;
                        }

                        data = angular.isArray(data) ? data : [data];
                        
                        return fn.apply(null, data);
                    } 
                };

                return exerciseCycleSrv;
            };
        }
    );
})(angular);
