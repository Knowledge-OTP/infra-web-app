(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('oathLoginDrv', function() {
        'ngInject';
        return {
            scope: {
                providers: '='
            },
            restrict: 'E',
            templateUrl: 'components/loginApp/templates/oathLogin.template.html',
            controller: 'OathLoginDrvController',
            bindToController: true,
            controllerAs: 'vm'
        };
    });
})(angular);
