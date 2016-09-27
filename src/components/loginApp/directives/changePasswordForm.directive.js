/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('changePasswordForm',
        function (LoginAppSrv, $timeout) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/changePasswordForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<',
                    backToLogin: '&'
                },
                link: function (scope) {
                    scope.resetPasswordSucceeded = false;
                    scope.showSpinner = false;
                    scope.passwordSubmit = function (changePasswordForm) {
                        changePasswordForm.email.$setValidity("noSuchEmail", true);
                        scope.showSpinner = true;
                        if (changePasswordForm.$invalid) {
                            scope.showSpinner = false;
                            return;
                        }
                        LoginAppSrv.resetPassword(scope.appContext.id, changePasswordForm.email.$viewValue, scope.userContext).then(function (resetPasswordSate) {
                            $timeout(function () {
                                if (angular.isUndefined(resetPasswordSate)) {
                                    scope.showSpinner = false;
                                    scope.resetPasswordSucceeded = true;
                                } else {
                                    if (resetPasswordSate.code === 'INVALID_USER') {
                                        scope.showSpinner = false;
                                        scope.resetPasswordSucceeded = false;
                                        changePasswordForm.email.$setValidity("noSuchEmail", false);
                                    }
                                }
                            })
                        });
                    }
                }
            };
        }
    );
})(angular);
