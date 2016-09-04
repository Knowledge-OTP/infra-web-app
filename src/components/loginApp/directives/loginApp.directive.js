/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp', [
        '$translatePartialLoader', 'LoginAppSrv',
        function ($translatePartialLoader, LoginAppSrv) {
            return {
                templateUrl: 'components/loginApp/templates/loginApp.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginApp');

                    scope.d = {
                        availableApps: LoginAppSrv.APPS,
                        selectedApp: LoginAppSrv.APPS.SAT
                    };

                    scope.currentForm = 'signup';
                    scope.selectApp = function(app) {
                        scope.d.selectedApp = app;
                    };

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
