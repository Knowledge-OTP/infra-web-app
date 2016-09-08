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

                    scope.signupSubmit = function(signupForm){
                        if (!scope.d.signupFormData) {
                            $window.alert('form is empty!', signupForm);
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData)
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

