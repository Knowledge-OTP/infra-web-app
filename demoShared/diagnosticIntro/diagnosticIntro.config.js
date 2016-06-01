(function (angular) {
    angular.module('demo')
        .config(function (DiagnosticIntroSrvProvider) {

            DiagnosticIntroSrvProvider.setConfigGetter(function (SubjectEnum) {
                return {
                    subjects: [
                        {
                            id: SubjectEnum.MATH.enum,
                            subjectNameAlias: 'math',
                            subjectIconName: 'math-icon'
                        },
                        {
                            id: SubjectEnum.VERBAL.enum,
                            subjectNameAlias: 'verbal',
                            subjectIconName: 'verbal-icon'
                        }
                    ],
                    all: {
                        subjectNameAlias: 'all',
                        hideSectionQuestion: true
                    },
                    none: {
                        subjectNameAlias: 'none',
                        hideSectionQuestion: true
                    }
                };
            });

            DiagnosticIntroSrvProvider.setActiveSubjectGetter(function (DiagnosticSrv, ExamSrv, ExerciseResultSrv, $q, ExerciseStatusEnum, SubjectEnum, ExerciseTypeEnum) {
                return DiagnosticSrv.getDiagnosticExamResult().then(function (diagnosticExamResult) {
                    if (!diagnosticExamResult) {
                        return 'none';
                    }

                    if (diagnosticExamResult.isComplete) {
                        return 'all';
                    }

                    var sectionResultsNum = Object.keys(diagnosticExamResult).length;
                    if (!sectionResultsNum) {
                        return 'none';
                    }

                    return DiagnosticSrv.getDiagnosticExamId().then(function (diagnosticExamId) {
                        return ExamSrv.getExam(diagnosticExamId).then(function (diagnosticExam) {
                            var sections = diagnosticExam.sections;
                            var allMathStatusProm = [];
                            sections.forEach(function (section) {
                                var getStatusProm = ExerciseResultSrv.getExerciseStatus(ExerciseTypeEnum.SECTION.enum, section.id);

                                if (section.subjectId === SubjectEnum.MATH.enum) {
                                    allMathStatusProm.push(getStatusProm);
                                }
                            });
                            return $q.all(allMathStatusProm)
                                .then(function (mathStatuses) {
                                    if (mathStatuses[0].status !== ExerciseStatusEnum.COMPLETED.enum || mathStatuses[1].status !== ExerciseStatusEnum.COMPLETED.enum ) {
                                        return SubjectEnum.MATH.enum;
                                    }

                                    return SubjectEnum.VERBAL.enum;
                                });
                        });
                    });
                });
            });
        });
})(angular);
