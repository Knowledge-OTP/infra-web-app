/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').directive('loginForm', [ 
        '$translatePartialLoader',
        function ($translatePartialLoader) {
            return {
                templateUrl: 'components/loginForm/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (/*scope, element, attrs*/) {
                    $translatePartialLoader.addPart('loginForm');
                }
            };
        }
    ]);
})(angular);

