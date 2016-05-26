/**
 * usage instructions:
 *      workout progress:
 *      - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{
 *                  background: red;
 *              }
 *      - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
                    border-color: red;
                }
 *
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra.scroll',
        'znk.infra.general'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('workoutsRoadmap', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: function data(ExerciseStatusEnum, WorkoutsSrv, /*WorkoutsDiagnosticFlow,*/ $q) {
                            'ngInject';

                            // var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([workoutsProgressProm, /*isDiagnosticCompletedProm, */]).then(function (res) {
                                var workoutsProgress = res[0];
                                var isDiagnosticCompleted = !!res[1];

                                return {
                                    diagnostic: {
                                        status: isDiagnosticCompleted ? ExerciseStatusEnum.COMPLETED.enum : ExerciseStatusEnum.ACTIVE.enum,
                                        workoutOrder: 0
                                    },
                                    workoutsProgress: workoutsProgress
                                };
                            });
                        }
                    },
                    controller: 'WorkoutsRoadMapController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.diagnostic.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm'
                })
            /*  .state('app.workouts.roadmap.diagnostic.preSummary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapBasePreSummary.template.html',
             controller: 'WorkoutsRoadMapBasePreSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.diagnostic.summary', {
             resolve: {
             diagnosticData: function (WorkoutsDiagnosticFlow) {
             'ngInject';
             return WorkoutsDiagnosticFlow.getDiagnostic().then(function (result) {
             return {
             userStats: result.userStats,
             compositeScore: result.compositeScore
             };
             });
             }
             },
             templateUrl: 'app/workouts/templates/workoutsRoadmapDiagnosticSummary.template.html',
             controller: 'WorkoutsRoadMapDiagnosticSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout', {
             url: '/workout?workout',
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkout.template.html',
             controller: 'WorkoutsRoadMapWorkoutController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.intro', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutIntro.template.html',
             controller: 'WorkoutsRoadMapWorkoutIntroController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.inProgress', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutInProgress.template.html',
             controller: 'WorkoutsRoadMapWorkoutInProgressController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.preSummary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapBasePreSummary.template.html',
             controller: 'WorkoutsRoadMapBasePreSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.summary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutSummary.template.html',
             controller: 'WorkoutsRoadMapWorkoutSummaryController',
             controllerAs: 'vm'
             })*/;
        }]);
})(angular);

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapController',
        function (data, $state, $scope, ExerciseStatusEnum, $location, $translatePartialLoader) {
            'ngInject';

            $translatePartialLoader.addPart('workoutsRoadmap');

            var vm = this;
            var activeWorkout;

            vm.workoutsProgress = data.workoutsProgress;
            vm.diagnostic = data.diagnostic;

            var search = $location.search();
            var DIAGNOSTIC_STATE = 'workoutsRoadmap.diagnostic';
            var WORKOUT_STATE = 'app.workouts.roadmap.workout';

            function getActiveWorkout() {
                var i = 0;
                for (; i < vm.workoutsProgress.length; i++) {
                    if (vm.workoutsProgress[i].status !== ExerciseStatusEnum.COMPLETED.enum) {
                        if (angular.isDefined(vm.workoutsProgress[i].subjectId)) {
                            return vm.workoutsProgress[i];
                        }
                        return data.diagnostic;
                    }
                }
                return vm.workoutsProgress[i - 1];
            }

            function _isFirstWorkoutStarted() {
                var firstWorkout = vm.workoutsProgress[0];
                return data.diagnostic.status !== ExerciseStatusEnum.COMPLETED.enum ||
                    angular.isUndefined(firstWorkout.subjectId);
            }

            function _setActiveWorkout() {
                activeWorkout = getActiveWorkout();
                vm.activeWorkoutOrder = +activeWorkout.workoutOrder;
            }

            _setActiveWorkout();


            switch ($state.current.name) {
                case DIAGNOSTIC_STATE:
                    vm.selectedItem = vm.diagnostic;
                    break;
                case WORKOUT_STATE:
                    var workoutOrder = +search.workout;
                    if (isNaN(workoutOrder) || workoutOrder < 0 || workoutOrder > vm.workoutsProgress.length) {
                        vm.selectedItem = activeWorkout;
                    } else {
                        vm.selectedItem = vm.workoutsProgress[workoutOrder - 1];
                    }
                    break;
                default:
                    if (_isFirstWorkoutStarted()) {
                        vm.selectedItem = vm.diagnostic;
                    } else {
                        vm.selectedItem = activeWorkout;
                    }
            }

            data.exercise = vm.selectedItem;

            data.roadmapCtrlActions = {};
            data.roadmapCtrlActions.setCurrWorkout = function (_workoutOrder) {
                if (!_workoutOrder) {
                    vm.selectedItem = vm.diagnostic;
                } else {
                    vm.selectedItem = vm.workoutsProgress[_workoutOrder - 1];
                }
                _setActiveWorkout();
            };
            data.roadmapCtrlActions.freezeWorkoutProgressComponent = function (freeze) {
                vm.freezeWorkoutProgressComponent = freeze;
            };

            var LEFT_ANIMATION = 'left-animation';
            var RIGHT_ANIMATION = 'right-animation';
            $scope.$watch('vm.selectedItem', function (newItem, oldItem) {
                if (angular.isUndefined(newItem)) {
                    return;
                }

                if (newItem !== oldItem) {
                    if (newItem.workoutOrder > oldItem.workoutOrder) {
                        vm.workoutSwitchAnimation = LEFT_ANIMATION;
                    } else {
                        vm.workoutSwitchAnimation = RIGHT_ANIMATION;
                    }
                }

                data.exercise = newItem;

                var currentStateName = $state.current.name;
                if (newItem.workoutOrder === 0) {
                    if (currentStateName !== DIAGNOSTIC_STATE) {
                        $state.go(DIAGNOSTIC_STATE);
                    }
                } else {
                    search = $location.search();
                    // the current state can be "app.workouts.roadmap.workout.intro"
                    // while the direct link is "app.workouts.roadmap.workout?workout=20"  so no need to navigate...
                    if (currentStateName.indexOf(WORKOUT_STATE) === -1 || +search.workout !== +newItem.workoutOrder) {
                        //$state.go('app.workouts.roadmap.workout', {
                        //     workout: newItem.workoutOrder
                        // });
                    }
                }
            });
        }
    );
})();

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        function ($state, ExerciseStatusEnum, data, $timeout) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        });
})();

// export class WorkoutsRoadMapDiagnosticController {
//     constructor($state, ExerciseStatusEnum, data, $timeout) {
//         'ngInject';
//         //  fixing page not rendered in the first app entrance issue
//         $timeout(function () {
//             switch (data.diagnostic.status) {
//                 case ExerciseStatusEnum.COMPLETED.enum:
//                     var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
//                     if (isFirstWorkoutStarted) {
//                         $state.go('.summary');
//                     } else {
//                         $state.go('.preSummary');
//                     }
//                     break;
//                 default:
//                     $state.go('.intro');
//             }
//         });
//     }
// }

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        function (/*WorkoutsDiagnosticFlow*/) {
            'ngInject';

            var vm = this;

            vm.state = 'workouts roadmap diagnostic intro';

            // WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {todo
            //     vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            // });
            vm.buttonTitle = 'START';
        });
})();

// export class WorkoutsRoadMapDiagnosticIntroController {
//     constructor(WorkoutsDiagnosticFlow) {
//         'ngInject';
//
//         var vm = this;
//
//         vm.state = 'workouts roadmap diagnostic intro';
//
//         WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
//             vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
//         });
//     }
// }

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                    'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/check-mark-icon.svg'
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

                                attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
                                    if (angular.isDefined(newActiveWorkoutOrder)) {
                                        _setProgressLineWidth(newActiveWorkoutOrder);
                                    }
                                });
                            }
                        };
                    }
                };

                return directive;
            }
        );
})();

// export function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
//     'ngInject';
//
//     var config = {
//         focusAnimateDuration: 500,
//         focuseAnimationTimingFunction: 'ease-in-out',
//         mouseLeaveBeforeFocusDelay: 2000
//     };
//
//     var directive = {
//         templateUrl: 'app/workouts/components/workoutProgress/workoutProgressDirective.template.html',
//         restrict: 'E',
//         require: 'ngModel',
//         scope: {
//             workoutsGetter: '&workouts',
//             diagnosticGetter: '&diagnostic',
//             activeWorkoutOrder: '@activeWorkoutOrder'
//         },
//         compile: function compile() {
//             return {
//                 pre: function pre(scope) {
//                     scope.vm = {};
//
//                     var workouts = scope.workoutsGetter() || [];
//
//                     scope.vm.workouts = workouts;
//                     scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
//                     //  added in order to treat the diagnostic as a workout what simplifies the code
//                     scope.vm.diagnostic.workoutOrder = 0;
//                 },
//                 post: function post(scope, element, attrs, ngModelCtrl) {
//                     var domElement = element[0];
//                     var focusOnSelectedWorkoutTimeoutProm;
//
//                     function mouseEnterEventListener() {
//                         if (focusOnSelectedWorkoutTimeoutProm) {
//                             $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
//                             focusOnSelectedWorkoutTimeoutProm = null;
//                         }
//                     }
//
//                     domElement.addEventListener('mouseenter', mouseEnterEventListener);
//
//                     function mouseLeaveEventListener() {
//                         focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
//                             scope.vm.focusOnSelectedWorkout();
//                         }, config.mouseLeaveBeforeFocusDelay, false);
//                     }
//
//                     domElement.addEventListener('mouseleave', mouseLeaveEventListener);
//
//                     function _setProgressLineWidth(activeWorkoutOrder) {
//                         var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
//                         if (itemsContainerDomeElement.length) {
//                             var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
//                             if (activeWorkoutDomElement) {
//                                 var LEFT_OFFSET = 40;
//                                 var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
//                                 progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
//                             }
//                         }
//                     }
//
//                     scope.vm.focusOnSelectedWorkout = function () {
//                         var parentElement = element.parent();
//                         var parentDomElement = parentElement[0];
//                         if (!parentDomElement) {
//                             return;
//                         }
//                         var containerWidth = parentDomElement.offsetWidth;
//                         var containerCenter = containerWidth / 2;
//
//                         var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
//                         if (!selectedWorkoutDomElement) {
//                             return;
//                         }
//                         var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
//                         var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
//                         var offset = containerCenter - scrollLeft;
//                         scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
//                     };
//
//                     function _selectWorkout(itemOrder, skipSetViewValue) {
//                         itemOrder = +itemOrder;
//                         if (isNaN(itemOrder)) {
//                             $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
//                             return;
//                         }
//                         var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
//                         scope.vm.selectedWorkout = itemOrder;
//                         scope.vm.focusOnSelectedWorkout();
//                         var selectedItem = items[itemOrder];
//                         if (!skipSetViewValue) {
//                             ngModelCtrl.$setViewValue(selectedItem);
//                         }
//                     }
//
//                     scope.vm.workoutClick = function (itemOrder) {
//                         if (attrs.disabled) {
//                             return;
//                         }
//                         _selectWorkout(itemOrder);
//                     };
//
//                     ngModelCtrl.$render = function () {
//                         if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
//                             $timeout(function () {
//                                 _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
//                                 _setProgressLineWidth(scope.activeWorkoutOrder);
//                             }, 0, false);
//                         }
//                     };
//
//                     scope.$on('$destroy', function () {
//                         domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
//                         domElement.removeEventListener('mouseenter', mouseEnterEventListener);
//                     });
//
//                     attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
//                         if (angular.isDefined(newActiveWorkoutOrder)) {
//                             _setProgressLineWidth(newActiveWorkoutOrder);
//                         }
//                     });
//                 }
//             };
//         }
//     };
//
//     return directive;
// }

angular.module('znk.infra-web-app.workoutsRoadmap').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html",
    "<znk-scroll actions=\"vm.scrollActions\" scroll-on-mouse-wheel=\"true\">\n" +
    "    <div class=\"items-container\">\n" +
    "        <div class=\"dotted-lines-container\">\n" +
    "            <div class=\"dotted-line progress\"></div>\n" +
    "            <div class=\"dotted-line future\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container diagnostic\">\n" +
    "            <div class=\"item\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === vm.diagnostic.workoutOrder\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(vm.diagnostic.workoutOrder)\">\n" +
    "                <ng-switch on=\"vm.diagnostic.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\"\n" +
    "                              name=\"workouts-progress-check-mark-icon\"\n" +
    "                              ng-switch-when=\"2\">\n" +
    "                    </svg-icon>\n" +
    "                    <svg-icon class=\"flag-icon\"\n" +
    "                              name=\"workouts-progress-flag\"\n" +
    "                              ng-switch-default>\n" +
    "                    </svg-icon>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container\"\n" +
    "             ng-repeat=\"workout in vm.workouts\">\n" +
    "            <div class=\"item\"\n" +
    "                 subject-id-to-attr-drv=\"workout.subjectId\"\n" +
    "                 suffix=\"bg\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === workout.workoutOrder,\n" +
    "                    pristine: workout.subjectId === undefined\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(workout.workoutOrder)\">\n" +
    "                <ng-switch on=\"workout.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\" name=\"workouts-progress-check-mark-icon\" ng-switch-when=\"2\"></svg-icon>\n" +
    "                    <span ng-switch-default>\n" +
    "                        {{::workout.workoutOrder}}\n" +
    "                    </span>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "    </div>\n" +
    "</znk-scroll>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmap.template.html",
    "<div class=\"app-workouts\">\n" +
    "    <div class=\"workouts-container base-border-radius base-box-shadow\">\n" +
    "        <workouts-progress workouts=\"vm.workoutsProgress\"\n" +
    "                           ng-disabled=\"vm.freezeWorkoutProgressComponent\"\n" +
    "                           diagnostic=\"vm.diagnostic\"\n" +
    "                           active-workout-order=\"{{vm.activeWorkoutOrder}}\"\n" +
    "                           ng-model=\"vm.selectedItem\">\n" +
    "        </workouts-progress>\n" +
    "        <div class=\"workout-container\"\n" +
    "             ng-class=\"vm.workoutSwitchAnimation\">\n" +
    "            <ui-view class=\"intro-ui-view\"></ui-view>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <estimated-score-widget></estimated-score-widget>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html",
    "<div translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"diagnostic-workout-pane base-border-radius\">\n" +
    "        <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "        <diagnostic-intro></diagnostic-intro>\n" +
    "        <md-button  class=\"md-primary znk\"\n" +
    "                    autofocus\n" +
    "                    tabindex=\"1\"\n" +
    "                    ui-sref=\"app.workouts.diagnostic({ skipIntro: true })\"\n" +
    "                    aria-label=\"{{::vm.buttonTitle}}\"\n" +
    "                    md-no-ink>{{::vm.buttonTitle | translate}}\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
