/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginForm',
        function ($translatePartialLoader, LoginAppSrv, $window) {
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

                    scope.loginSubmit = function(loginForm){
                        if (!scope.d.loginFormData) {
                            $window.alert('form is empty!', loginForm);
                            return;
                        }
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData).catch(function(err){
                            console.error(err);
                            $window.alert(err);
                        });
                    };
                }
            };
        }
    );
})(angular);
