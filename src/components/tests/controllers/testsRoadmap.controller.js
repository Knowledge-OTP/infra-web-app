(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').controller('TestsRoadmap.controller',
        function (testsData, diagnosticData, TestsRoadmap, $log, SubjectEnum, TestScoreCategoryEnum, $state, purchaseService, $stateParams, $q) {
        'ngInject';
            
            var vm = this;
            var OVERLAY_TYPE_UPGRADE = 'upgrade';
            var OVERLAY_TYPE_DIAGNOSTIC = 'diagnostic';
            var OVERLAY_TYPE_COMPLETE = 'completeSection';
            var OVERLAY_TYPE_NONE = false;

            vm.exams = testsData.exams;
            vm.examsResults = testsData.examsResults;
            vm.overlayType = OVERLAY_TYPE_NONE;
            vm.currentExam = void(0);
            vm.subjectEnum = SubjectEnum;
            vm.activeExamId = $stateParams.exam;

            vm.sectionTitle = function (subjectId) {
                return SubjectEnum.getValByEnum(subjectId);
            };

            vm.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            vm.getTestIconName = function (id) {
                var name;
                switch (id) {
                    case TestScoreCategoryEnum.MATH.enum:
                        name = 'math-icon';
                        break;
                    case TestScoreCategoryEnum.READING.enum:
                        name = 'reading-icon';
                        break;
                    case TestScoreCategoryEnum.WRITING.enum:
                        name = 'writing-icon';
                        break;
                    case TestScoreCategoryEnum.ESSAY.enum:
                        name = 'essay-icon';
                        break;
                    default:
                        $log.error('TestsRoadMapController getTestIconName: can\'t find any matching categoryId! categoryId: ' + id);
                }
                return name;
            };

            function _extendSection(exerciseResults, sections, exam, examResult) {
                angular.forEach(exerciseResults, function (exercise) {
                    if (angular.isDefined(exercise.startedTime) && exercise.questionResults.length > 0) {
                        var examSection = TestsRoadmap.getExamSection(exam, +exercise.exerciseId);
                        var correctQuestionsNumber = exercise.correctAnswersNum;
                        var answersNumber = exercise.correctAnswersNum + exercise.wrongAnswersNum;
                        var avgTimePerQuestion = exercise.avgTimePerQuestion;
                        var avgTimePerQuestionFormat = (avgTimePerQuestion < 1000) ? Math.ceil(avgTimePerQuestion / 1000) : Math.floor(avgTimePerQuestion / 1000);

                        angular.extend(examSection, {
                            duration: exercise.duration,
                            startedTime: exercise.startedTime,
                            endedTime: exercise.endedTime || false,
                            correctQuestionsNumber: correctQuestionsNumber,
                            answersNumber: answersNumber,
                            isComplete: exercise.isComplete || false,
                            avgTimePerQuestion: avgTimePerQuestionFormat
                        });
                    }
                });

                vm.loading = false;

                if (TestsRoadmap.isTypeFull(exam.typeId) && exam.isComplete) {
                    var subScoreAndCrossScoresProm = $q.when(false);
                    if (!examResult.scores.subScores) {
                        subScoreAndCrossScoresProm = TestsRoadmap.getFullExamSubAndCrossScores(sections, exerciseResults);
                    }
                    subScoreAndCrossScoresProm.then(function (scores) {
                        vm.subScoreReady = true;
                        vm.crossTestScoreReady = true;
                        // save scores to examResult
                        if (scores) {
                            if (!examResult.scores) {
                                examResult.scores = {};
                            }
                            examResult.scores.subScores = TestsRoadmap.groupBySubjectId(scores.subScores);
                            examResult.scores.crossTestScores = scores.crossTestScores;
                            examResult.$save();
                        }
                    });
                }

                return exam;
            }

            function _setCurrentExam(exam, prevExam) {
                var examCopy = angular.copy(exam);
                var examResults;
                var prevExamResults;
                var isAllSubjectLocked;
                // if diagnostic has not done yet, show the diagnostic overlay
                if (!diagnosticData) {
                    vm.currentExam = examCopy;
                    vm.testsReady = true;
                    vm.overlayType = OVERLAY_TYPE_DIAGNOSTIC;
                    return;
                }
                isAllSubjectLocked = TestsRoadmap.isAllSubjectLocked(examCopy);
                // if all subject are locked, show the upgrade overlay
                if (isAllSubjectLocked) {
                    vm.currentExam = examCopy;
                    vm.testsReady = true;
                    vm.overlayType = OVERLAY_TYPE_UPGRADE;
                    return;
                }
                // if there are exam results, set things in motion
                examResults = TestsRoadmap.getExamResult(vm.examsResults, examCopy.id);
                if (examResults && examResults[0]) {
                    vm.scores = examResults[0].scores;
                    if (examResults[0].isComplete) {
                        examCopy.isComplete = true;
                    }
                    if (examResults[0].sectionResults) {
                        vm.currentExam = examCopy;
                        vm.testsReady = true;
                        TestsRoadmap.getExamsAndExerciseResults(examCopy, examResults).then(function (results) {
                            _extendSection(results.exerciseResults, results.examSection, examCopy, examResults[0]);
                        });
                    }
                } else {
                    vm.loading = false;
                    vm.currentExam = examCopy;
                    vm.testsReady = true;
                }
                // if prev exam is not complete show the complete section overlay
                prevExamResults = (prevExam) ? TestsRoadmap.getExamResult(vm.examsResults, prevExam.id) : false;
                TestsRoadmap.isSectionInPrevExamCompleted(prevExamResults).then(function (isSectionCompleteExist) {
                    if (!isSectionCompleteExist) {
                        vm.overlayType = OVERLAY_TYPE_COMPLETE;
                    }
                });
            }

            function _setInitialTestVars() {
                vm.subScoreReady = false;
                vm.crossTestScoreReady = false;
                vm.testsReady = false;
                vm.loading = true;
                vm.overlayType = OVERLAY_TYPE_NONE;
                vm.compositeScore = false;
            }

            vm.onExamClick = function (exam, prevExam) {
                $log.debug('TestsRoadMapController onExamClick active exam:', exam);
                $log.debug('TestsRoadMapController onExamClick prev exam:', prevExam);
                _setInitialTestVars();
                _setCurrentExam(exam, prevExam);
            };

            vm.onSubjectClick = function (subjectBox) {
                if (subjectBox.isAvail) {
                    $state.go('app.tests.section', {
                        examId: vm.currentExam.id,
                        sectionId: subjectBox.id
                    });
                } else {
                    vm.showPurchaseDialog();
                }
            };
        }
    );
})(angular);
