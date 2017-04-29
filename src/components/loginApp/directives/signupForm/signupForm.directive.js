/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm',
        function (LoginAppSrv, $log, $timeout) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/directives/signupForm/signupForm.template.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        termsOfUseHref: '//www.zinkerz.com/terms-of-use/',
                        privacyPolicyHref: '//www.zinkerz.com/privacy-policy/'
                    };

                    scope.signupSubmit = function (signupForm) {
                        signupForm.email.$setValidity("emailTaken", true);
                        if (signupForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData)
                            .then(function () {
                                hideSpinner();
                                scope.d.disableBtn = false;
                            })
                            .catch(function (err) {
                                $timeout(function () {
                                    if (err.code === 'EMAIL_TAKEN') {
                                        console.log(signupForm.email);
                                        signupForm.email.$setValidity("emailTaken", false);
                                    }
                                });
                                hideSpinner();
                                scope.d.disableBtn = false;
                                $log.error(err);
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

