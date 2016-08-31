/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.regComponent').directive('loginForm', [
        '$translatePartialLoader', 'regComponentSrv',
        function ($translatePartialLoader, regComponentSrv) {
            return {
                templateUrl: 'components/regComponent/templates/loginForm.directive.html',
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

