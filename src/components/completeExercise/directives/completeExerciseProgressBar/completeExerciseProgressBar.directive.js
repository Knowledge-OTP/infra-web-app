(function (angular) {
    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseProgressBar', function () {
            'ngInject';

            var directive = {
                restrict: 'E',
                templateUrl: 'components/completeExercise/directives/completeExerciseProgressBar/completeExerciseProgressBarDirective.template.html',
                scope: {
                    totalTime: '@',
                    duration: '<'
                },
                link: function (scope, element) {
                    var isAnimationSet,prevCls;
                    var BAR_CLASSES = {
                        'GREEN': 'green-state',
                        'YELLOW': 'yellow-state',
                        'RED': 'red-state',

                    };

                    function _getDurationPercentage(){
                        var totalTime = scope.totalTime;
                        return parseInt(newDuration / totalTime * 100, 10);
                    }

                    function _setAnimation() {
                        var domElement = element[0];

                        var progressBar = domElement.querySelector('.progress-bar');

                        progressBar.style.transform
                    }

                    function _getBarColorClass(durationPercentage){
                        if (durationPercentage < 40) {
                            return BAR_CLASSES.RED;
                        }

                        if (durationPercentage < 70) {
                            return BAR_CLASSES.YELLOW;
                        }

                        return BAR_CLASSES.GREEN;
                    }

                    scope.$watch('duration', function (newDuration) {
                        if(angular.isUndefined(newDuration)){
                            return;
                        }

                        if(!isAnimationSet){
                            _setAnimation();
                        }

                        var durationPercentage = _getDurationPercentage();
                        var clsToAdd = _getBarColorClass(durationPercentage);

                        if(prevCls === clsToAdd){
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
