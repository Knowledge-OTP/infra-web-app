(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseTimerParser', function completeExerciseTimer(){
            var directive = {
                restrict: 'A',
                require: 'ngModel',
                link: {
                    pre: function(scope, element, attrs, ngModelCtrl){
                        ngModelCtrl.$parsers.push(function(timeLeft){
                            var config = scope.$eval(attrs.config);
                            var maxTime = config.max;
                            return maxTime - timeLeft;
                        });

                        ngModelCtrl.$formatters.push(function(duration){
                            var config = scope.$eval(attrs.config);
                            var maxTime = config.max;
                            return maxTime - duration;
                        });
                    }
                }
            };
            return directive;
        });
})(angular);

