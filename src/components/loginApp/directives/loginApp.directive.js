/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('regComponent', [
        '$translatePartialLoader', 'regComponentContextSrv',
        function ($translatePartialLoader, regComponentContextSrv) {
            return {
                templateUrl: 'components/loginApp/templates/regComponent.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginApp');

                    scope.d = {
                        availableApps: regComponentContextSrv.getAvailableApps(),
                        selectedApp: regComponentContextSrv.getDefaultApp()
                    };

                    scope.showLogin = true;
                    scope.showSignup = true;

                    // App select menu
                    var originatorEv;
                    scope.openMenu = function($mdOpenMenu, ev) {
                        originatorEv = ev;
                        $mdOpenMenu(ev);
                    };
                }
            };
        }
    ]);
})(angular);
