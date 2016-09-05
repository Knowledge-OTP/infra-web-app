/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm', [
        '$translatePartialLoader', 'LoginAppSrv', '$timeout', '$translate', '$log',
        function ($translatePartialLoader, LoginAppSrv, $timeout, $translate, $log) {
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('loginApp');

                    scope.d = {
                       userContext: LoginAppSrv.USER_CONTEXT
                    };

                    scope.signupSubmit = function(){
                        if (!scope.d.signupFormData) {
                            return;
                        }
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);

