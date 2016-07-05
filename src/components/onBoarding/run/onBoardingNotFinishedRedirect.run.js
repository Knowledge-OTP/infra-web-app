(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding').run(function ($rootScope, OnBoardingService, $state) {
        'ngInject';
        var isOnBoardingCompleted = false;
        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {//eslint-disable-line
            if (isOnBoardingCompleted) {
                return;
            }

            var APP_WORKOUTS_STATE = 'app.workouts.roadmap';
            var isGoingToWorkoutsState = toState.name.indexOf(APP_WORKOUTS_STATE) !== -1;

            if (isGoingToWorkoutsState) {
                evt.preventDefault();

                OnBoardingService.isOnBoardingCompleted().then(function (_isOnBoardingCompleted) {
                    isOnBoardingCompleted = _isOnBoardingCompleted;

                    if (!isOnBoardingCompleted) {
                        var ON_BOARDING_STATE_NAME = 'app.onBoarding';
                        var isNotFromOnBoardingState = fromState.name.indexOf(ON_BOARDING_STATE_NAME) === -1;
                        if (isNotFromOnBoardingState) {
                            $state.go(ON_BOARDING_STATE_NAME);
                        }
                    } else {
                        $state.go(toState, toParams, {
                            reload: true
                        });
                    }
                });
            }
        });
    });

})(angular);
