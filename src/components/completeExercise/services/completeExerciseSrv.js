(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').service('CompleteExerciseSrv',
        function (ENV, UserProfileService, TeacherContextSrv, ExerciseTypeEnum, ExerciseResultSrv, $log, $q) {
            'ngInject';

            this.VIEW_STATES = {
                NONE: 0,
                INTRO: 1,
                EXERCISE: 2,
                SUMMARY: 3
            };

            this.MODE_STATES = {
                SHARER: 1,
                VIEWER: 2
            };

            this.getContextUid = function () {
                var isStudentApp = ENV.appContext === 'student';
                if (isStudentApp) {
                    return UserProfileService.getCurrUserId();
                } else {
                    return TeacherContextSrv.getCurrUid();
                }
            };

            this.getExerciseResult = function (exerciseDetails, shMode) {
                if(shMode === this.MODE_STATES.VIEWER){
                    if(!exerciseDetails.resultGuid){
                        var errMsg = 'completeExerciseSrv: exercise details is missing guid property';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return ExerciseResultSrv.getExerciseResultByGuid(exerciseDetails.resultGuid);
                }

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
