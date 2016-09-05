/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp', [
        '$translatePartialLoader', 'LoginAppSrv', '$location',
        function ($translatePartialLoader, LoginAppSrv, $location) {
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

                    var socialProvidersArr = ['facebook', 'google'];

                    LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                    scope.currentUserContext =  'student';
                    scope.currentForm = 'signup';

                    scope.selectApp = function(app) {
                        scope.d.appContext = app;
                        LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);
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

                    var search = $location.search();
                    if (!angular.equals(search, {}) && (search.app || search.state)) {
                        if (search.app) {
                            angular.forEach(LoginAppSrv.APPS, function(app, index){
                                if (index.toLowerCase() === search.app.toLowerCase()) {
                                    scope.selectApp(app);
                                }
                            });
                        }
                        if (search.state) {
                            scope.changeCurrentForm(search.state);
                        }
                        $location.search('app', null);
                        $location.search('state', null);
                    }
                }
            };
        }
    ]);
})(angular);
