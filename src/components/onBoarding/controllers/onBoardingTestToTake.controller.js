(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingTestToTakeController',
        function ($state, OnBoardingService, ExerciseTypeEnum, ExerciseParentEnum, ENV) {
            'ngInject';

            this.completeExerciseDetails = {
                exerciseId: ENV.testToTakeExerciseId,
                exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                exerciseParentId: ENV.testToTakeExamId,
                exerciseParentTypeId: ExerciseParentEnum.EXAM.enum,
                hideQuit: false,
                timeEnabled: false,
                ignoreIntro: true
            };
            this.completeExerciseSettings = {
                continueAction: function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                    $state.go('app.onBoarding.diagnostic');
                },
                setOnBoardingSummaryStepAction: function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                },
                exitAction: function () {
                    $state.go('app.onBoarding.introTestToTake');
                }
            };
        });
})(angular);
