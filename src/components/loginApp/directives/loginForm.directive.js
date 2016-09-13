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
                        if (loginForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData)
                            .then(function(authData){
                                console.log("Authenticated successfully with payload: ", authData);
                            })
                            .catch(function(err){
                                console.error(err);
                                if (err) {
                                    var loginError;
                                    switch (err.code) {
                                        case "INVALID_EMAIL":
                                            loginError = "The specified email is invalid.";
                                            break;
                                        case "INVALID_PASSWORD":
                                            loginError ="The specified password is incorrect.";
                                            break;
                                        case "INVALID_USER":
                                            loginError = "The specified user account does not exist.";
                                            break;
                                        default:
                                            loginError = "Error logging user in: " + err.code;
                                    }
                                    $timeout(function(){
                                        hideSpinner();
                                        scope.d.disableBtn = false;
                                        scope.d.loginError = loginError;
                                    });
                                }
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
