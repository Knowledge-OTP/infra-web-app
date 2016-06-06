(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                    'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/check-mark-icon.svg',
                    'workouts-progress-tutorial-icon': 'components/workoutsRoadmap/svg/tutorial-icon.svg',
                    'workouts-progress-practice-icon': 'components/workoutsRoadmap/svg/practice-icon.svg',
                    'workouts-progress-game-icon': 'components/workoutsRoadmap/svg/game-icon.svg',
                    'workouts-progress-drill-icon': 'components/workoutsRoadmap/svg/drill-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]) 
        .directive('workoutsProgress',
            function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
                'ngInject';

                var config = {
                    focusAnimateDuration: 500,
                    focuseAnimationTimingFunction: 'ease-in-out',
                    mouseLeaveBeforeFocusDelay: 2000
                };

                var directive = {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html',
                    restrict: 'E',
                    require: 'ngModel',
                    scope: {
                        workoutsGetter: '&workouts',
                        diagnosticGetter: '&diagnostic',
                        activeWorkoutOrder: '@activeWorkoutOrder'
                    },
                    compile: function compile() {
                        return {
                            pre: function pre(scope) {
                                scope.vm = {};

                                var workouts = scope.workoutsGetter() || [];

                                scope.vm.workouts = workouts;
                                scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
                                //  added in order to treat the diagnostic as a workout what simplifies the code
                                scope.vm.diagnostic.workoutOrder = 0;
                            },
                            post: function post(scope, element, attrs, ngModelCtrl) {
                                var domElement = element[0];
                                var focusOnSelectedWorkoutTimeoutProm;

                                function mouseEnterEventListener() {
                                    if (focusOnSelectedWorkoutTimeoutProm) {
                                        $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
                                        focusOnSelectedWorkoutTimeoutProm = null;
                                    }
                                }

                                domElement.addEventListener('mouseenter', mouseEnterEventListener);

                                function mouseLeaveEventListener() {
                                    focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
                                        scope.vm.focusOnSelectedWorkout();
                                    }, config.mouseLeaveBeforeFocusDelay, false);
                                }

                                domElement.addEventListener('mouseleave', mouseLeaveEventListener);

                                function _setProgressLineWidth(activeWorkoutOrder) {
                                    var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
                                    if (itemsContainerDomeElement.length) {
                                        var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
                                        if (activeWorkoutDomElement) {
                                            var LEFT_OFFSET = 40;
                                            var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
                                            progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
                                        }
                                    }
                                }

                                scope.vm.focusOnSelectedWorkout = function () {
                                    var parentElement = element.parent();
                                    var parentDomElement = parentElement[0];
                                    if (!parentDomElement) {
                                        return;
                                    }
                                    var containerWidth = parentDomElement.offsetWidth;
                                    var containerCenter = containerWidth / 2;

                                    var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
                                    if (!selectedWorkoutDomElement) {
                                        return;
                                    }
                                    var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
                                    var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
                                    var offset = containerCenter - scrollLeft;
                                    scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
                                };

                                function _selectWorkout(itemOrder, skipSetViewValue) {
                                    itemOrder = +itemOrder;
                                    if (isNaN(itemOrder)) {
                                        $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
                                        return;
                                    }
                                    var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
                                    scope.vm.selectedWorkout = itemOrder;
                                    scope.vm.focusOnSelectedWorkout();
                                    var selectedItem = items[itemOrder];
                                    if (!skipSetViewValue) {
                                        ngModelCtrl.$setViewValue(selectedItem);
                                    }
                                }

                                scope.vm.workoutClick = function (itemOrder) {
                                    if (attrs.disabled) {
                                        return;
                                    }
                                    _selectWorkout(itemOrder);
                                };

                                ngModelCtrl.$render = function () {
                                    if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
                                        $timeout(function () {
                                            _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
                                            _setProgressLineWidth(scope.activeWorkoutOrder);
                                        }, 0, false);
                                    }
                                };

                                scope.$on('$destroy', function () {
                                    domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
                                    domElement.removeEventListener('mouseenter', mouseEnterEventListener);
                                });

                                // attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
                                //     if (angular.isDefined(newActiveWorkoutOrder)) {
                                //         _setProgressLineWidth(newActiveWorkoutOrder);
                                //     }
                                // });
                            }
                        };
                    }
                };

                return directive;
            }
        );
})();
