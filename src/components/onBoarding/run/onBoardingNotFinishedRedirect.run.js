(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding').run(function ($rootScope, OnBoardingService, $state, ENV) {
        'ngInject';
        var isOnBoardingCompleted = false;
        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {//eslint-disable-line
            evt.preventDefault();
            OnBoardingService.getMarketingToefl().then(function (marketingObj) {
                if (isOnBoardingCompleted) {
                    if (marketingObj && marketingObj.status) {
                        OnBoardingService.updatePage(toState.name);
                    }
                    $state.go(toState, toParams, {
                        reload: true
                    });
                }
                else {
                    // statuses:  7 - app  , 1 - diagnostic
                    if (marketingObj && marketingObj.status && marketingObj.status !== 1 && marketingObj.status !== 7 && toState.name !== 'app.diagnostic.preSummary') {
                        handleToeflMarketingRedirect(marketingObj);
                    } else {
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
                                        if (marketingObj && marketingObj.status) {
                                            OnBoardingService.updatePage(ON_BOARDING_STATE_NAME);
                                        }
                                        $state.go(ON_BOARDING_STATE_NAME);
                                    }
                                } else {
                                    if (marketingObj && marketingObj.status) {
                                        OnBoardingService.updatePage(toState.name);
                                    }
                                    $state.go(toState, toParams, {
                                        reload: true
                                    });
                                }
                            });
                        }
                    }
                }

                function handleToeflMarketingRedirect(marketingObj) {
                    var state = '';
                    switch (marketingObj.status) {
                        case 2:
                            state = 'email';
                            break;
                        case 3:
                            state = 'verifyEmail';
                            break;
                        case 4:
                            state = 'purchase';
                            break;
                        case 5:
                            state = 'purchase';
                            break;
                        case 6:
                            state = 'signup';
                            break;
                        default:
                            state = 'purchase';
                    }
                    window.location.href = `${ENV.zinkerzWebsiteBaseUrl}myzinkerz/toefl/${state}`;
                }
            });
        });
    });

})(angular);
