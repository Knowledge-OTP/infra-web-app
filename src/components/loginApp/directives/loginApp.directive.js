/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('regComponent', [
        '$translatePartialLoader', 'regComponentContextSrv',
        function ($translatePartialLoader, regComponentContextSrv) {
            return {
                templateUrl: 'components/regComponent/templates/regComponent.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('regComponent');

                    scope.d = {
                        availableApps: regComponentContextSrv.getAvailableApps(),
                        selectedApp: regComponentContextSrv.getDefaultApp()
                    };

                    scope.showLogin = true;
                    scope.showSignup = true;
                }
            };
        }
    ]);
})(angular);
