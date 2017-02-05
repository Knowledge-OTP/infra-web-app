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
        }]);
})(angular);
