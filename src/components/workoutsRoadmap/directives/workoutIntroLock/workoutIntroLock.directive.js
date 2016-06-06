/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'workouts-intro-lock-dotted-arrow': 'components/workoutsRoadmap/svg/dotted-arrow.svg',
                'workouts-intro-lock-lock': 'components/workoutsRoadmap/svg/lock-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        })
        .directive('workoutIntroLock',
            function (DiagnosticSrv, ExerciseStatusEnum, $stateParams, $q, SocialSharingSrv) {
                'ngInject';

                return {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html',
                    restrict: 'E',
                    transclude: true,
                    scope: {
                        workoutsProgressGetter: '&workoutsProgress'
                    },
                    link: function (scope, element, attrs) {
                        var currWorkoutOrder = +$stateParams.workout;
                        var workoutsProgress = scope.workoutsProgressGetter();
                        var currWorkout = workoutsProgress[currWorkoutOrder - 1];

                        scope.vm = {};

                        var LOCK_STATES = {
                            NO_LOCK: -1,
                            DIAGNOSTIC_NOT_COMPLETED: 1,
                            PREV_NOT_COMPLETED: 2,
                            NO_PRO_SOCIAL_SHARING: 3,
                            BUY_PRO: 4
                        };

                        var setLockStateFlowControlProm = DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                            if (status !== ExerciseStatusEnum.COMPLETED.enum) {
                                scope.vm.lockState = LOCK_STATES.DIAGNOSTIC_NOT_COMPLETED;
                                element.addClass('lock');
                                return $q.reject(null);
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            var FIRST_WORKOUT_ORDER = 1;
                            if (currWorkoutOrder > FIRST_WORKOUT_ORDER) {
                                var prevWorkoutIndex = currWorkoutOrder - 2;
                                var prevWorkout = workoutsProgress[prevWorkoutIndex];
                                if (prevWorkout.status !== ExerciseStatusEnum.COMPLETED.enum) {
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.PREV_NOT_COMPLETED;
                                    return $q.reject(null);
                                }
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            if(!currWorkout.isAvail){
                                return SocialSharingSrv.getSocialSharingData().then(function(socialSharingData){
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.NO_PRO_SOCIAL_SHARING;

                                    angular.forEach(socialSharingData,function(wasShared){
                                        if(wasShared){
                                            scope.vm.lockState = LOCK_STATES.BUY_PRO;
                                        }
                                    });

                                    return $q.reject(null);
                                });
                            }
                        });

                        setLockStateFlowControlProm.then(function(){
                            scope.vm.lockState = LOCK_STATES.NO_LOCK;
                        });
                    }
                };
            }
        );
})(angular);

