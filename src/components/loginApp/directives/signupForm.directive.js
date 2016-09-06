/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm',
        function ($translatePartialLoader, LoginAppSrv, $window) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
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

                    scope.signupSubmit = function(){
                        if (!scope.d.signupFormData) {
                            $window.alert('form is empty!');
                            return;
                        }
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData).catch(function(err){
                            console.error(err);
                            $window.alert(err);
                        });
                    };
                }
            };
        }
    );
})(angular);

