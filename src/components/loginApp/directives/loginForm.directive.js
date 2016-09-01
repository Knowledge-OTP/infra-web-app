/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginForm', [
        '$translatePartialLoader', 'LoginAppSrv',
        function ($translatePartialLoader, LoginAppSrv) {
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginForm');

                    scope.vm = {};

                    scope.loginSubmit = function(){
                        if (!scope.vm.loginFormData) {
                            return;
                        }
                        regComponentSrv.login(scope.vm.loginFormData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);

