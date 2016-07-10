(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.performance').config(
        function ($stateProvider) {
            'ngInject';
            $stateProvider
                .state('app.performance', {
                    url: '/performance',
                    templateUrl: 'components/performance/templates/performance.template.html',
                    controller: 'PerformanceController',
                    controllerAs: 'vm'
                })

        });
})(angular);
