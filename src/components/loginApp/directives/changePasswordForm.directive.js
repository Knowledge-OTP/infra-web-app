/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('changePasswordForm',
        function (LoginAppSrv, PopUpSrv) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/changePasswordForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {
                    scope.resetPasswordSucceeded = false;
                    scope.passwordSubmit = function (changePasswordForm) {
                        if (changePasswordForm.$invalid) {
                            return;
                        }
                        debugger;
                        LoginAppSrv.resetPassword(scope.appContext.id, changePasswordForm.email.$viewValue, scope.userContext).then(function (resetPasswordSate) {
                            if (angular.isUndefined(resetPasswordSate)) {
                                scope.resetPasswordSucceeded = true;
                            } else {
                                scope.resetPasswordSucceeded = false;
                                PopUpSrv.error('OOPS...', 'Email was not sent', 'Accept', 'Cancel');
                            }
                        })
                    }
                }
            };
        }
    );
})(angular);
