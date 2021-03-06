(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.subjectsOrder').provider('SubjectsSrv', [
        function () {
            var _subjectOrderGetter;
            this.setSubjectOrder = function (subjectOrderGetter) {
                _subjectOrderGetter = subjectOrderGetter;
            };

            this.$get = function ($q, $log, $injector) {
                'ngInject';
                var SubjectsSrv = {};
                SubjectsSrv.getSubjectOrder = function () {
                    if (!_subjectOrderGetter) {
                        var errMsg = 'subjectOrder Service: subjectOrderGetter was not set.';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }
                    if (angular.isFunction(_subjectOrderGetter)) {
                        return $q.when($injector.invoke(_subjectOrderGetter));
                    }
                };
                return SubjectsSrv;
            };
        }
    ]);
})(angular);
