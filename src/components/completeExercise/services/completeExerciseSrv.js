(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').service('CompleteExerciseSrv',
        function (ENV, UserProfileService, TeacherContextSrv, ExerciseTypeEnum, ExerciseResultSrv) {
            'ngInject';

            this.VIEW_STATES = {
                NONE: 0,
                INTRO: 1,
                EXERCISE: 2,
                SUMMARY: 3
            };

            this.getContextUid = function () {
                var isStudentApp = ENV.appContext === 'student';
                if (isStudentApp) {
                    return UserProfileService.getCurrUserId();
                } else {
                    return TeacherContextSrv.getCurrUid();
                }
            };

            this.getExerciseResult = function (exerciseDetails) {
                switch (exerciseDetails.exerciseTypeId) {
                    case ExerciseTypeEnum.LECTURE.enum:
                        return this.getContextUid().then(function (uid) {
                            return ExerciseResultSrv.getModuleExerciseResult(
                                uid,
                                exerciseDetails.parentId,
                                exerciseDetails.exerciseTypeId,
                                exerciseDetails.exerciseId
                            );
                        });
                    default:
                        return ExerciseResultSrv.getExerciseResult(
                            exerciseDetails.exerciseTypeId,
                            exerciseDetails.exerciseId,
                            exerciseDetails.exerciseParentId
                        );
                }
            };
        }
    );
})(angular);
