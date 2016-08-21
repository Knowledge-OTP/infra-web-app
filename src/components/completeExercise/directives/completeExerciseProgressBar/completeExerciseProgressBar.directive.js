(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseProgressBar',
            function ($animate, $timeout) {
                'ngInject';

                var directive = {
                    restrict: 'E',
                    templateUrl: 'components/completeExercise/directives/completeExerciseProgressBar/completeExerciseProgressBarDirective.template.html',
                    scope: {
                        totalTime: '@',
                        duration: '<'
                    },
                    link: function (scope, element) {
                        var isAnimationSet, prevCls;
                        var BAR_CLASSES = {
                            'GREEN': 'green-state',
                            'YELLOW': 'yellow-state',
                            'RED': 'red-state',

                        };

                        function _getTotalTime() {
                            return +scope.totalTime;
                        }

                        function _getDuration() {
                            return scope.duration || 0;
                        }

                        function _getDurationPercentage() {
                            var totalTime = _getTotalTime();
                            var duration = _getDuration();
                            return parseInt(duration / totalTime * 100, 10);
                        }

                        function _setAnimation() {
                            var domElement = element[0];
                            var progressBarDomElement = domElement.querySelector('.progress-bar');

                            var durationPercentage = _getDurationPercentage();
                            var parentWidth = domElement.offsetWidth;
                            var translateX = (parseInt(parentWidth * (durationPercentage / 100), 10) - parentWidth) + 'px';
                            progressBarDomElement.style.transform = 'translateX(' + translateX + ')';

                            var fromCss = {};
                            var totalTime = _getTotalTime();
                            var duration = _getDuration();
                            var timeLeft = totalTime - duration;
                            fromCss.transition = 'transform linear ' + timeLeft + 'ms';

                            var toCss = {
                                transform: 'translateX(0)'
                            };
                            $timeout(function(){
                                $animate.animate(progressBarDomElement, fromCss, toCss);
                            });
                        }

                        function _getBarColorClass(durationPercentage) {
                            if (durationPercentage > 70) {
                                return BAR_CLASSES.RED;
                            }

                            if (durationPercentage > 40) {
                                return BAR_CLASSES.YELLOW;
                            }

                            return BAR_CLASSES.GREEN;
                        }

                        scope.$watch('duration', function (newDuration) {
                            if (angular.isUndefined(newDuration)) {
                                return;
                            }

                            if (!isAnimationSet) {
                                _setAnimation();
                                isAnimationSet = true;
                            }

                            var durationPercentage = _getDurationPercentage();
                            var clsToAdd = _getBarColorClass(durationPercentage);

                            if (prevCls === clsToAdd) {
                                return;
                            }

                            element.addClass(clsToAdd);
                            element.removeClass(prevCls);
                            prevCls = clsToAdd;
                        });
                    }
                };

                return directive;
            });
})(angular);
