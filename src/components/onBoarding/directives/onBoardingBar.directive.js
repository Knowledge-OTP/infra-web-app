(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('onBoardingBar', function OnBoardingBarDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/onBoardingBar/onBoardingBar.template.html',
            scope: {
                step: '@'
            }
        };

        return directive;
    });

})(angular);

