(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').provider('EstimatedScoreWidgetSrv', [
        function () {
            var _subjectToIndexMapGetter;
            this.setSubjectToIndexMapGetter = function(subjectToIndexMapGetter){
                _subjectToIndexMapGetter = subjectToIndexMapGetter;
            };

            this.$get = function ($log, $injector, $q) {
                'ngInject';

                var EstimatedScoreWidgetSrv = {};

                EstimatedScoreWidgetSrv.getSubjectToIndexMap = function(){
                    if(!_subjectToIndexMapGetter){
                        var errMsg = 'EstimatedScoreWidgetSrv: subjectToIndexMapGetter was not set';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return $q.when($injector.invoke(_subjectToIndexMapGetter));
                };

                return EstimatedScoreWidgetSrv;
            }
        }
    ]);
})(angular);
