(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv', 'ExerciseTypeEnum', 'ExerciseParentEnum',
        function ($state, OnBoardingService, znkAnalyticsSrv, ExerciseTypeEnum, ExerciseParentEnum) {
            this.completeExerciseDetails = {
                exerciseId: 1173,
                exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                exerciseParentId: 43,
                exerciseParentTypeId: ExerciseParentEnum.EXAM.enum
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
