/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginForm',
        function (LoginAppSrv, $timeout, $translate, $log) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<',
                    changePasswordClick: '&'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        changePassword: false
                    };

                    scope.loginSubmit = function(loginForm) {
                        if (loginForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData)
                            .then(function(authData){
                                $log.debug("Authenticated successfully with payload: ", authData);
                            })
                            .catch(function(err){
                                $log.error(err);
                                if (err) {
                                    var errorCodeStrings;
                                    var errorCodesPath = 'LOGIN_FORM.ERROR_CODES.';
                                    var errorCodesStringKeysArr = [
                                        errorCodesPath + 'INVALID_EMAIL',
                                        errorCodesPath + 'INVALID_PASSWORD',
                                        errorCodesPath + 'INVALID_USER',
                                        errorCodesPath + 'DEFAULT_ERROR'
                                    ];
                                    $translate(errorCodesStringKeysArr)
                                        .then(function(tranlations){
                                            var loginError;
                                            errorCodeStrings = tranlations;
                                            switch (err.code) {
                                                case "INVALID_EMAIL":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_EMAIL'];
                                                    break;
                                                case "INVALID_PASSWORD":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_PASSWORD'];
                                                    break;
                                                case "INVALID_USER":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_USER'];
                                                    break;
                                                default:
                                                    loginError = errorCodeStrings[errorCodesPath + 'DEFAULT_ERROR'] + err.code;
                                            }
                                            $timeout(function(){
                                                hideSpinner();
                                                scope.d.disableBtn = false;
                                                scope.d.loginError = loginError;
                                            });
                                        })
                                        .catch(function(err){
                                            $log.error('Cannot fetch translation! ', err);
                                        });
                                }
                            });
                    };

                    scope.replaceToChangePassword = function () {
                        scope.d.changePassword = !scope.d.changePassword;
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
