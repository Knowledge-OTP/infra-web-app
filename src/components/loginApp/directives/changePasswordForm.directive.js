/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('changePasswordForm',
        function () {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/changePasswordForm.directive.html',
                restrict: 'E',
                link: function (scope) {

                }
            };
        }
    );
})(angular);
