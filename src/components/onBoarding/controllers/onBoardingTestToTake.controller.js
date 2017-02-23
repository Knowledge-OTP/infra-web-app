(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingTestToTakeController',
        function ($state, OnBoardingService, znkAnalyticsSrv, ExerciseTypeEnum, ExerciseParentEnum, ENV) {
            'ngInject';
            var onBordingSettings = OnBoardingService.getOnBoardingSettings();

            this.completeExerciseDetails = {
                exerciseId: ENV.testToTakeExerciseId,
                exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                exerciseParentId: ENV.testToTakeExamId,
                exerciseParentTypeId: ExerciseParentEnum.EXAM.enum,
                hideQuit: true,
                timeEnabled:false,
                ignoreIntro: true
            };
            this.completeExerciseSettings = {
                continueAction: function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                    if (onBordingSettings.ignoreDiagnosticIntro){
                        $state.go('app.diagnostic');
                    } else {
                        $state.go('app.onBoarding.diagnostic');
                    }
                },
                setOnBoardingSummaryStepAction: function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                }
            };
        });
})(angular);
