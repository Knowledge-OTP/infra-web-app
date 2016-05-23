(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/userGoals/templates/goalSelect.template.html',
            require: 'ngModel',
            scope: {
                minScore: '=',
                maxScore: '=',
                updateGoalNum: '='
            },
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.updateGoal = function (isPlus) {
                    scope.target += (isPlus) ? scope.updateGoalNum : -Math.abs(scope.updateGoalNum);
                    if (scope.target < scope.minScore) {
                        scope.target = scope.minScore;
                    } else if (scope.target > scope.maxScore) {
                        scope.target = scope.maxScore;
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
