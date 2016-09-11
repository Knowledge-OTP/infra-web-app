/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginForm',
        function ($translatePartialLoader, LoginAppSrv, $window, $timeout) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT
                    };

                    scope.loginSubmit = function(loginForm) {
                        if (!scope.d.loginFormData) {
                            $window.alert('form is empty!', loginForm);
                            return;
                        }
                        scope.startLoader = true;
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData)
                            .then(function(){
                                scope.fillLoader = true;
                                $timeout(function () {
                                    scope.startLoader = false;
                                    scope.fillLoader = false;
                                }, 100);
                            })
                            .catch(function(err){
                                scope.fillLoader = true;
                                $timeout(function () {
                                    scope.startLoader = false;
                                    scope.fillLoader = false;
                                }, 100);
                                console.error(err);
                                $window.alert(err);
                            });
                    };
                }
            };
        }
    );
})(angular);
