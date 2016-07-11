(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.performance').provider('PerformanceSrv', [
        function () {
            var _subjectMapGetter;

            this.setSubjectsMap = function (subjectsMapGetter) {
                _subjectMapGetter = subjectsMapGetter;
            };

            this.$get = function ($q, $log, $injector) {
                'ngInject';
                var PerformanceSrv = {};

                PerformanceSrv.getSubjectsMap = function () {
                    if (!_subjectMapGetter) {
                        var errMsg = 'PerformanceSrv: _subjectMapGetter was not set.';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return $q.when($injector.invoke(_subjectMapGetter));
                };

                return PerformanceSrv;
            };
        }
    ]);
})(angular);
