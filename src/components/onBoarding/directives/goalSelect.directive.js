(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/onBoarding/templates/goalSelect.template.html',
            require: 'ngModel',
            scope: {},
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.MAX_SCORE = 800;
                scope.MIN_SCORE = 200;

                scope.updateGoal = function (add) {
                    scope.target += add;
                    if (scope.target < scope.MIN_SCORE) {
                        scope.target = scope.MIN_SCORE;
                    } else if (scope.target > scope.MAX_SCORE) {
                        scope.target = scope.MAX_SCORE;
                    }

                    if (angular.isFunction(scope.onChange)) {
                        scope.onChange();
                    }
                    ngModelCtrl.$setViewValue(scope.target);
                };

                ngModelCtrl.$render = function () {
                    scope.target = ngModelCtrl.$viewValue;
                };
            }
        };

        return directive;
    });

})(angular);
