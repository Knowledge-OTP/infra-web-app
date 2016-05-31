(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').provider('EstimatedScoreWidgetSrv', [
        function () {
            var _subjectOrderGetter;
            this.setSubjectOrder = function(subjectOrderGetter){
                _subjectOrderGetter = subjectOrderGetter;
            };

            this.$get = function ($log, $injector, $q) {
                'ngInject';

                var EstimatedScoreWidgetSrv = {};

                EstimatedScoreWidgetSrv.getSubjectOrder = function(){
                    if(!_subjectOrderGetter){
                        var errMsg = 'EstimatedScoreWidgetSrv: subjectOrderGetter was not set';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return $q.when($injector.invoke(_subjectOrderGetter));
                };

                return EstimatedScoreWidgetSrv;
            }
        }
    ]);
})(angular);
