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
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        userContext: LoginAppSrv.USER_CONTEXT.STUDENT
                    };

                    scope.currentUserContext =  'student';
                    scope.currentForm = 'signup';
                    scope.selectApp = function(app) {
                        scope.d.appContext = app;
                    };

                    scope.changeCurrentForm = function (currentForm) {
                      scope.currentForm = currentForm;
                    };

                    scope.changeUserContext = function (context) {
                        scope.d.userContext = context;
                        if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.STUDENT) {
                            scope.currentUserContext =  'student';
                        } else if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.TEACHER) {
                            scope.currentUserContext =  'teacher';
                        }
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