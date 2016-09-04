/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm', [
        '$translatePartialLoader', 'LoginAppSrv',
        function ($translatePartialLoader, LoginAppSrv) {
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope, element, attrs) {
                    $translatePartialLoader.addPart('signupForm');

                    scope.d = {};

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

