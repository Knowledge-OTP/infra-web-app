
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('promoCode',
        function () {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/promoCode.template.html',
                restrict: 'E',
                scope: {

                },
                link: function (scope) {

                }
            };
        }
    );
})(angular);
