(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.performance').controller('PerformanceController',
        function ($translatePartialLoader) {
            'ngInject';
            $translatePartialLoader.addPart('performance');

            var vm = this;

        }
    );
})(angular);
