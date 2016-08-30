/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.regComponent').directive('signupForm', [
        '$translatePartialLoader', 'regComponentSrv',
        function ($translatePartialLoader, regComponentSrv) {
            return {
                templateUrl: 'components/regComponent/templates/signupForm.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('signupForm');

                    scope.vm = {};

                    scope.vm.submit = function(){
                        regComponentSrv.signup(scope.vm.formData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);

