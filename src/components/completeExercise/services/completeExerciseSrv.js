(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').service('CompleteExerciseSrv',
        function (ENV, UserProfileService, TeacherContextSrv, ExerciseTypeEnum, ExerciseResultSrv,
                  $log, $q, ExerciseParentEnum, BaseExerciseGetterSrv) {
            'ngInject';

            var self = this;
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
                    return $q.when(TeacherContextSrv.getCurrUid());
                }
            };

            this.getExerciseResult = function (exerciseDetails, shMode) {
                var isLecture = exerciseDetails.exerciseTypeId === ExerciseTypeEnum.LECTURE.enum;

                if (shMode === this.MODE_STATES.VIEWER) {
                    if (!exerciseDetails.resultGuid) {
                        var errMsg = 'completeExerciseSrv: exercise details is missing guid property';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return ExerciseResultSrv.getExerciseResultByGuid(exerciseDetails.resultGuid);
                }

                switch (exerciseDetails.exerciseParentTypeId) {
                    case ExerciseParentEnum.MODULE.enum:
                        if (isLecture) {
                            return ExerciseResultSrv.getExerciseResult(
                                exerciseDetails.exerciseTypeId,
                                exerciseDetails.exerciseId,
                                exerciseDetails.exerciseParentId
                            );
                        }

                        var examIdProm = $q.when();
                        if (exerciseDetails.exerciseTypeId === ExerciseTypeEnum.SECTION.enum) {
                            examIdProm = BaseExerciseGetterSrv.getExerciseByNameAndId('exam', exerciseDetails.examId);
                        }

                        return examIdProm.then(function (examData) {
                            return self.getContextUid().then(function (uid) {
                                var examId = examData && examData.id ? examData.id : undefined;
                                return ExerciseResultSrv.getModuleExerciseResult(
                                    uid,
                                    exerciseDetails.exerciseParentId,
                                    exerciseDetails.exerciseTypeId,
                                    exerciseDetails.exerciseId,
                                    exerciseDetails.assignContentType,
                                    examId
                                );
                            });
                        });
                    default:
                        return ExerciseResultSrv.getExerciseResult(
                            exerciseDetails.exerciseTypeId,
                            exerciseDetails.exerciseId,
                            exerciseDetails.exerciseParentId,
                            exerciseDetails.examSectionsNum
                        );
                }
            };
        }
    );
})(angular);
