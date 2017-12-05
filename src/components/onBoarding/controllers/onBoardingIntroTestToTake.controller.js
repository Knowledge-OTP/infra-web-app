(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingIntroTestToTakeController',
        function ($state, OnBoardingService, SubjectEnum, CategoryService) {
            'ngInject';
            this.skipTestToTake = function () {
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                CategoryService.setUserSelectedLevel1Category(SubjectEnum.MATHLVL1.enum);
                $state.go('app.onBoarding.diagnostic');

            };
            this.goToTestToTake = function () {
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.TEST_TO_TAKE);
                $state.go('app.onBoarding.testToTake');
            };
        });
})(angular);
