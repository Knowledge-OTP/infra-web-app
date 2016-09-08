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

                    scope.loginSubmit = function(loginForm) {
                        if (!scope.d.loginFormData) {
                            $window.alert('form is empty!', loginForm);
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData)
                            .then(function(){
                                hideSpinner();
                                scope.d.disableBtn = false;
                            })
                            .catch(function(err){
                                hideSpinner();
                                scope.d.disableBtn = false;
                                console.error(err);
                                $window.alert(err);
                            });
                    };

                    function showSpinner() {
                        scope.d.showSpinner = true;
                    }

                    function hideSpinner() {
                        scope.d.showSpinner = false;
                    }
                }
            };
        }
    );
})(angular);
