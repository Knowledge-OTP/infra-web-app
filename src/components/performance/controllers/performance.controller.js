(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.performance').controller('PerformanceController',
        function ($translatePartialLoader, PerformanceSrv) {
            'ngInject';
            $translatePartialLoader.addPart('performance');
            var vm = this;
            PerformanceSrv.getSubjectsMap().then(function (subjectsMap) {
                vm.subjectsMap = subjectsMap;
            });
        }
    );
})(angular);
