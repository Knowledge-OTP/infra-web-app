(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv', 'ExerciseTypeEnum', 'ExerciseParentEnum', 'ENV',
        function ($state, OnBoardingService, znkAnalyticsSrv, ExerciseTypeEnum, ExerciseParentEnum, ENV) {
            this.completeExerciseDetails = {
                exerciseId: 1173,
                exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                exerciseParentId: ENV.testToTakeExamId,
                exerciseParentTypeId: ExerciseParentEnum.EXAM.enum,
                ignoreIntro: true
            };
            this.completeExerciseSettings = {

                // exitAction: exerciseData.exitAction,
                // exerciseParentContent: exerciseParentContentProm.then(function (moduleContent) {
                //     return {
                //         name: moduleContent.name
                //     };
                // })
            };
        }]);
})(angular);
