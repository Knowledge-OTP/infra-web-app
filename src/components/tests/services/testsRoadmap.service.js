(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').provider('testsRoadmapSrv', [
        function () {
            var _subjectsMapGetter;

            this.setSubjectsMap = function (subjectsMapGetter) {
                _subjectsMapGetter = subjectsMapGetter;
            };


            this.$get = function ($log, $injector, $q, ExerciseResultSrv, ExamSrv, ScoringService, ExerciseTypeEnum) {
                'ngInject';

                var testsRoadmapSrv = {};

                testsRoadmapSrv.getSubjectsMap = function () {
                    if (!_subjectsMapGetter) {
                        var errMsg = 'TestsRoadmapSrv: subjectsMapGetter was not set.';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }
                    return $q.when($injector.invoke(_subjectsMapGetter));
                };

                testsRoadmapSrv.getExamResult = function (examsResults, examId) {
                    return examsResults.filter(function (examsResult) {
                        return examsResult && +examsResult.examId === +examId;
                    });
                };

                testsRoadmapSrv.getExamSection = function (exam, sectionId) {
                    var examSection;
                    for (var i = 0, ii = exam.sections.length; i < ii; i++) {
                        if (exam.sections[i].id === sectionId) {
                            examSection = exam.sections[i];
                            break;
                        }
                    }
                    return examSection;
                };

                testsRoadmapSrv.isAllSubjectLocked = function (exam) {
                    var isAvail = true;
                    for (var i = 0, ii = exam.sections.length; i < ii; i++) {
                        if (exam.sections[i].isAvail) {
                            isAvail = false;
                            break;
                        }
                    }
                    return isAvail;
                };

                testsRoadmapSrv.filterArrByCategoryId = function (arr, id) {
                    return arr.filter(function (result) {
                        return +result.categoryId !== id;
                    });
                };

                testsRoadmapSrv.getExerciseIdByCategoryId = function (arr, id) {
                    var exerciseId;
                    for (var i = 0, ii = arr.length; i < ii; i++) {
                        if (arr[i].categoryId === id) {
                            exerciseId = arr[i].id;
                            break;
                        }
                    }
                    return exerciseId;
                };

                testsRoadmapSrv.getExamsAndExerciseResults = function (examCopy, examResults) {
                    var examResult = examResults[0];
                    var sectionResults = Object.keys(examResult.sectionResults);
                    var exerciseResultsProms = [];
                    var examSectionProms = [];
                    angular.forEach(sectionResults, function (sectionId) {
                        sectionId = +sectionId;
                        exerciseResultsProms.push(ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examCopy.id, null, true));
                        examSectionProms.push(testsRoadmapSrv.getExamSection(examCopy, sectionId));
                    });
                    var getAllExerciseResultsProm = $q.all(exerciseResultsProms);
                    var getAllExamSectionsProm = $q.all(examSectionProms);
                    return $q.all([getAllExerciseResultsProm, getAllExamSectionsProm]).then(function (res) {
                        var exerciseResults = res[0];
                        var examSection = res[1];
                        return {
                            exerciseResults: exerciseResults,
                            examSection: examSection
                        };
                    });
                };

                var subjectOrderProm = testsRoadmapSrv.getSubjectsMap();

                testsRoadmapSrv.getFullExamSubAndCrossScores = function (sections, sectionsResults) {
                    $q.when(subjectOrderProm).then(function (res) {
                        var subjectsOrder = res;
                        var essayEnum;
                        for (var i = 0; i < subjectsOrder.subjects.length; i++) {
                            if (subjectsOrder.subjects[i].id === 8) {
                                essayEnum = subjectsOrder.subjects[i].id;
                            }
                        }
                        var essayExerciseId = testsRoadmapSrv.getExerciseIdByCategoryId(sections, essayEnum);
                        var newSections = testsRoadmapSrv.filterArrByCategoryId(sections, essayEnum);
                        var newSectionsResults = sectionsResults.filter(function (sectionResult) {
                            return +sectionResult.exerciseId !== essayExerciseId;
                        });
                        return ScoringService.getFullExamSubAndCrossScores(newSections, newSectionsResults);
                    });
                };

                testsRoadmapSrv.isTypeFull = function (typeId) {
                    return ScoringService.isTypeFull(typeId);
                };

                testsRoadmapSrv.groupBySubjectId = function (obj) {
                    var newObj = {};
                    angular.forEach(obj, function (value) {
                        if (!newObj[value.subjectId]) {
                            newObj[value.subjectId] = [];
                        }
                        newObj[value.subjectId].push(value);
                    });
                    return newObj;
                };

                testsRoadmapSrv.isSectionInPrevExamCompleted = function (prevExam) {
                    var exerciseResultsProms = [];
                    var sectionResults;
                    if (angular.isArray(prevExam) && prevExam.length === 0) {
                        return $q.when(false);
                    }
                    if (!prevExam) {
                        return $q.when(true);
                    }
                    sectionResults = Object.keys(prevExam[0].sectionResults);
                    angular.forEach(sectionResults, function (keyValue) {
                        exerciseResultsProms.push(ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, +keyValue, prevExam[0].examId, null, true));
                    });
                    return $q.all(exerciseResultsProms).then(function (exerciseResults) {
                        var isSectionCompleteExist = false;
                        for (var i = 0, ii = exerciseResults.length; i < ii; i++) {
                            if (exerciseResults[i].isComplete) {
                                isSectionCompleteExist = true;
                                break;
                            }
                        }
                        return isSectionCompleteExist;
                    });
                };
                return testsRoadmapSrv;
            };
        }
    ]);
})(angular);
