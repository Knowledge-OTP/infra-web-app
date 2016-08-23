(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config(
        function ($stateProvider) {
            'ngInject';
            $stateProvider
                .state('app.faq', {
                    url: '/faq',
                    templateUrl: 'components/faq/templates/faq.template.html',
                    controller: 'FaqController',
                    controllerAs: 'vm'
            });
        });
})(angular);
