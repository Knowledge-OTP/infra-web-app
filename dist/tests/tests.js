(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests', [
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.scoring',
        'znk.infra.exams',
        'znk.infra-web-app.diagnostic',
        'znk.infra.analytics',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.estimatedScoreWidget',
        'znk.infra.exerciseUtility',
        'ui.router'
    ]).config([
        'SvgIconSrvProvider',
        
        function (SvgIconSrvProvider) {
            var svgMap = {
                'tests-check-mark-icon': 'components/tests/svg/check-mark-icon.svg',
                'tests-locked-icon': 'components/tests/svg/locked-icon.svg',
                'tests-subject-locked-icon': 'components/tests/svg/subject-locked-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }

    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.tests', {
                    url: '/tests',
                    template: '<ui-view></ui-view>'
                })
                .state('app.tests.roadmap', {
                    url: '/roadmap?exam',
                    templateUrl: 'components/tests/templates/testsRoadmap.template.html',
                    resolve: {
                        testsData: function (ExamSrv, ExerciseResultSrv, $q) {
                            return ExamSrv.getAllExams(true).then(function (exams) {
                                var examResultsProms = [];
                                angular.forEach(exams, function (exam) {
                                    examResultsProms.push(ExerciseResultSrv.getExamResult(exam.id, true));
                                });
                                return $q.all(examResultsProms).then(function (examsResults) {
                                    return {
                                        exams: exams,
                                        examsResults: examsResults
                                    };
                                });
                            });
                        },
                        diagnosticData: function (DiagnosticSrv) {
                             DiagnosticSrv.getDiagnosticStatus().then(function (result) {
                                 var isDiagnosticsComplete = result === 2;
                                return (isDiagnosticsComplete) ? isDiagnosticsComplete : false;
                            });
                            // return DiagnosticSrv.getDiagnosticStatus().then(function (result) {
                            //     return (result.isComplete) ? result.isComplete : false;
                            // });
                        }
                    },
                    controller: 'TestsRoadmapController',
                    controllerAs: 'vm'
                })
                .state('app.tests.section', {
                    url: '/section/:examId/:sectionId',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsWorkoutController',
                    resolve: {
                        exerciseData: function exerciseData($q, ExamSrv, $stateParams, ExerciseTypeEnum, ExerciseResultSrv, $state, $filter) {
                            var examId = +$stateParams.examId;
                            var sectionId = +$stateParams.sectionId;
                            var getSectionProm = ExamSrv.getExamSection(sectionId);
                            var getExam = ExamSrv.getExam(examId);
                            var getExamResultProm = ExerciseResultSrv.getExamResult(examId);
                            return $q.all([getExam, getExamResultProm]).then(function (results) {
                                var examExercise = results[0];
                                var examResultsExercise = results[1];
                                var getExerciseResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examId, examExercise.sections.length);
                                return {
                                    headerTitlePrefix: $filter('translate')('TEST_TEST.SECTION'),
                                    exerciseProm: getSectionProm,
                                    exerciseResultProm: getExerciseResultProm,
                                    exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                                    examData: examExercise,
                                    examResult: examResultsExercise,
                                    headerExitAction: function () {
                                        $state.go('app.tests.roadmap', {exam: $stateParams.examId});
                                    }
                                };
                            });
                        }
                    },
                    controllerAs: 'vm'
                })
                .state('app.tests.section.intro', {
                    templateUrl: 'components/tests/templates/testsSectionIntro.template.html',
                    controller: 'TestsSectionIntroController',
                    controllerAs: 'vm'
                });
                /*.state('app.tests.section.exercise', {
                    views: {
                        '@app': {
                            templateUrl: 'app/workouts/templates/workoutsWorkoutExercise.template.html',
                            controller: 'WorkoutsWorkoutExerciseController',
                            controllerAs: 'vm'
                        }
                    },
                    onExit: function (exerciseData) {
                        if (angular.isDefined(exerciseData.resultsData)) {
                            exerciseData.resultsData.$save();
                        }
                    }
                })
                .state('app.tests.section.summary', {
                    views: {
                        '@app': {
                            templateUrl: 'app/workouts/templates/workoutsWorkoutSummary.template.html',
                            controller: 'WorkoutsWorkoutSummaryController',
                            controllerAs: 'vm'
                        }
                    }
                });*/
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').controller('NavigationPaneController',
        function (ExamTypeEnum, $log, $translatePartialLoader) {
        'ngInject';
            var self = this;

            $translatePartialLoader.addPart('tests');
            
            self.activeId = void(0);

            function _filterExams() {
                var alreadySetActive = false;
                self.exams = angular.copy(self.exams);
                var examsReduce = self.exams.reduce(function (prevContent, currentValue, currentIndex) {
                    var examResults = self.examsResults[currentIndex];
                    currentValue.isCompleted = (examResults && examResults.isComplete) ? examResults.isComplete : false;

                    if (currentValue.typeId === ExamTypeEnum.FULL_TEST.enum) {
                        prevContent.fullExams.push(currentValue);
                    } else if (currentValue.typeId === ExamTypeEnum.MINI_TEST.enum) {
                        prevContent.miniExams.push(currentValue);
                    } else {
                        $log.error('NavigationPaneController _filterExams: typeId is undefined or wrong type id!');
                    }

                    if (self.activeExam && currentValue.id === +self.activeExam) {
                        alreadySetActive = true;
                        self.activeId = currentValue.id;
                        self.onExamClick({ exam: currentValue, prevExam: prevContent[currentIndex - 1] });
                    }

                    return prevContent;
                }, {
                    fullExams: [],
                    miniExams: []
                });

                if (!alreadySetActive) {
                    _setActiveExam(examsReduce, examsReduce.miniExams);
                }

                return examsReduce;
            }

            function _setActiveExam(exams, examsType, last) {
                var isActive = false;
                for (var i = 0, ii = examsType.length; i < ii; i++) {
                    if (!examsType[i].isCompleted) {
                        self.activeId = examsType[i].id;
                        isActive = true;
                        self.onExamClick({ exam: examsType[i], prevExam: examsType[i - 1] });
                        break;
                    }
                }
                if (isActive) {
                    return;
                }
                if (!isActive && !last) {
                    _setActiveExam(exams, exams.fullExams, true);
                }
                if (last) {
                    self.activeId = exams.miniExams[0].id;
                    self.onExamClick({ exam: exams.miniExams[0], prevExam: void(0) });
                }
            }

            self.changeActive = function (id) {
                if (id !== self.activeId) {
                    self.activeId = id;
                }
            };

           this.exams = _filterExams();
        }
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').controller('TestsRoadmapController',
        function (testsData, diagnosticData, testsRoadmapSrv, $log, SubjectEnum, $state, purchaseService, $stateParams, $q, EstimatedScoreWidgetSrv, $translatePartialLoader) {
        'ngInject';

            $translatePartialLoader.addPart('tests');

            var vm = this;
            var subjectOrderProm = testsRoadmapSrv.getSubjectsMap();
            var subjectsObj;
            var OVERLAY_TYPE_UPGRADE = 'upgrade';
            var OVERLAY_TYPE_DIAGNOSTIC = 'diagnostic';
            var OVERLAY_TYPE_COMPLETE = 'completeSection';
            var OVERLAY_TYPE_NONE = false;

            $q.when(subjectOrderProm).then(function (res){
                subjectsObj = res.subjects;
            });

            vm.exams = testsData.exams;
            vm.examsResults = testsData.examsResults;
            vm.overlayType = OVERLAY_TYPE_NONE;
            vm.currentExam = void(0);
            vm.subjectEnum = SubjectEnum;
            vm.hello = subjectsObj;
            vm.activeExamId = $stateParams.exam;

            vm.sectionTitle = function (subjectId) {
                return SubjectEnum.getValByEnum(subjectId);
            };

            vm.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };


                 vm.getTestIconName = function (id) {
                     var name;
                     for (var i = 0; i < subjectsObj.length; i++) {
                         if (subjectsObj[i].id === id) {
                             name = subjectsObj[i].subjectIconName;
                         }
                     }
                     return name;
                 };


            function _extendSection(exerciseResults, sections, exam, examResult) {
                angular.forEach(exerciseResults, function (exercise) {
                    if (angular.isDefined(exercise.startedTime) && exercise.questionResults.length > 0) {
                        var examSection = testsRoadmapSrv.getExamSection(exam, +exercise.exerciseId);
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

                if (testsRoadmapSrv.isTypeFull(exam.typeId) && exam.isComplete) {
                    var subScoreAndCrossScoresProm = $q.when(false);
                    if (!examResult.scores.subScores) {
                        subScoreAndCrossScoresProm = testsRoadmapSrv.getFullExamSubAndCrossScores(sections, exerciseResults);
                    }
                    subScoreAndCrossScoresProm.then(function (scores) {
                        vm.subScoreReady = true;
                        vm.crossTestScoreReady = true;
                        // save scores to examResult
                        if (scores) {
                            if (!examResult.scores) {
                                examResult.scores = {};
                            }
                            examResult.scores.subScores = testsRoadmapSrv.groupBySubjectId(scores.subScores);
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
                isAllSubjectLocked = testsRoadmapSrv.isAllSubjectLocked(examCopy);
                // if all subject are locked, show the upgrade overlay
                if (isAllSubjectLocked) {
                    vm.currentExam = examCopy;
                    vm.testsReady = true;
                    vm.overlayType = OVERLAY_TYPE_UPGRADE;
                    return;
                }
                // if there are exam results, set things in motion
                examResults = testsRoadmapSrv.getExamResult(vm.examsResults, examCopy.id);
                if (examResults && examResults[0]) {
                    vm.scores = examResults[0].scores;
                    if (examResults[0].isComplete) {
                        examCopy.isComplete = true;
                    }
                    if (examResults[0].sectionResults) {
                        vm.currentExam = examCopy;
                        vm.testsReady = true;
                        testsRoadmapSrv.getExamsAndExerciseResults(examCopy, examResults).then(function (results) {
                            _extendSection(results.exerciseResults, results.examSection, examCopy, examResults[0]);
                        });
                    }
                } else {
                    vm.loading = false;
                    vm.currentExam = examCopy;
                    vm.testsReady = true;
                }
                // if prev exam is not complete show the complete section overlay
                prevExamResults = (prevExam) ? testsRoadmapSrv.getExamResult(vm.examsResults, prevExam.id) : false;
                testsRoadmapSrv.isSectionInPrevExamCompleted(prevExamResults).then(function (isSectionCompleteExist) {
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

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').controller('TestsSectionIntroController',
        function (exerciseData, $state, ExamTypeEnum, SubjectEnum, $stateParams, znkAnalyticsSrv, TestScoreCategoryEnum, $filter, $translatePartialLoader) {
            'ngInject';


            $translatePartialLoader.addPart('tests');

            var typeFull = (exerciseData.examData.typeId === ExamTypeEnum['FULL TEST'].enum);
            var translateFilter = $filter('translate');

            this.sideTextByExamType = typeFull ? '.FULL_TEST_TEXT' : '.MINI_TEST_TEXT';
            this.exerciseNum = exerciseData.examData.name.match(/\d+/)[0];
            this.subjectId = exerciseData.exercise.subjectId;
            this.subjectEnum = SubjectEnum;
            this.questionCount = exerciseData.exercise.questionCount;
            this.time = exerciseData.exercise.time;
            this.isCalc = exerciseData.exercise.calculator;
            this.categoryId = exerciseData.exercise.categoryId;
            this.categoryName = exerciseData.exercise.categoryId;
            this.TestScoreCategoryEnum = TestScoreCategoryEnum;

            var translateSuffix;
            translateSuffix = TestScoreCategoryEnum.getValByEnum(this.categoryId);
            translateSuffix = angular.uppercase(translateSuffix);
            if (this.categoryId === TestScoreCategoryEnum.MATH.enum) {
                translateSuffix += this.isCalc ? '_CALCULATOR' : '_NO_CALCULATOR';
            }
            this.testScoreIntroName = translateFilter('TEST_SECTION_INTRO.' + translateSuffix);
            this.testScoreInstructions = translateFilter('TEST_SECTION_INTRO.INSTRUCTIONS_' + translateSuffix);

            this.onClickedQuit = function () {
                $state.go('app.tests.roadmap', {exam: $stateParams.examId});
            };

            this.goToExercise = () => {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'sectionStarted',
                    props: {
                        testType: typeFull ? 'full' : 'mini',
                        subjectType: this.subjectId,
                        examId: exerciseData.examData.id,
                        sectionId: exerciseData.exercise.id,
                        testName: exerciseData.examData.name
                    }
                });
                znkAnalyticsSrv.timeTrack({eventName: 'sectionCompleted'});
                exerciseData.exerciseResult.seenIntro = true;
                exerciseData.exerciseResult.$save();
                $state.go('^.exercise');
            };
            typeFull = (exerciseData.examData.typeId === ExamTypeEnum['FULL TEST'].enum);
            translateFilter = $filter('translate');

            this.sideTextByExamType = typeFull ? '.FULL_TEST_TEXT' : '.MINI_TEST_TEXT';
            this.exerciseNum = exerciseData.examData.name.match(/\d+/)[0];
            this.subjectId = exerciseData.exercise.subjectId;
            this.subjectEnum = SubjectEnum;
            this.questionCount = exerciseData.exercise.questionCount;
            this.time = exerciseData.exercise.time;
            this.isCalc = exerciseData.exercise.calculator;
            this.categoryId = exerciseData.exercise.categoryId;
            this.categoryName = exerciseData.exercise.categoryId;
            this.TestScoreCategoryEnum = TestScoreCategoryEnum;

            translateSuffix = TestScoreCategoryEnum.getValByEnum(this.categoryId);
            translateSuffix = angular.uppercase(translateSuffix);
            if (this.categoryId === TestScoreCategoryEnum.MATH.enum) {
                translateSuffix += this.isCalc ? '_CALCULATOR' : '_NO_CALCULATOR';
            }
            this.testScoreIntroName = translateFilter('TEST_SECTION_INTRO.' + translateSuffix);
            this.testScoreInstructions = translateFilter('TEST_SECTION_INTRO.INSTRUCTIONS_' + translateSuffix);

            this.onClickedQuit = function () {
                $state.go('app.tests.roadmap', {exam: $stateParams.examId});
            };

            this.goToExercise = () => {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'sectionStarted',
                    props: {
                        testType: typeFull ? 'full' : 'mini',
                        subjectType: this.subjectId,
                        examId: exerciseData.examData.id,
                        sectionId: exerciseData.exercise.id,
                        testName: exerciseData.examData.name
                    }
                });
                znkAnalyticsSrv.timeTrack({eventName: 'sectionCompleted'});
                exerciseData.exerciseResult.seenIntro = true;
                exerciseData.exerciseResult.$save();
                $state.go('^.exercise');
            };
        }
    );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane', 
        function ($translatePartialLoader) {
            'ngInject';
            return {
                scope: {
                    activeExam: '=?',
                    exams: '=',
                    onExamClick: '&',
                    title: '@',
                    examsResults: '='
                },
                restrict: 'E',
                templateUrl: 'components/tests/templates/navigationPane.template.html',
                controller: 'NavigationPaneController',
                bindToController: true,
                controllerAs: 'vm',
                link: function () {
                    $translatePartialLoader.addPart('tests');
                }
            };
        }
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').filter('timeFilter',
        function ($filter) {
            'ngInject';
            return function (input, timeFormat) {
                timeFormat = timeFormat || 'mm';
                var newInput;
                if (timeFormat === 'customMin') {
                    /*jshint ignore:start*/
                    newInput = (input / 1000 / 60) << 0;
                    /*jshint ignore:end*/
                } else {
                    newInput = $filter('date')(input, timeFormat);
                }
                return newInput;
            };
        }
    );
})(angular);

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
                            exerciseResults,
                            examSection
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

// describe('testing directive "NavigationPaneController":', function () {
//     // Load  the module, which contains the directive
//     beforeEach(angular.mock.module('actWebApp', 'pascalprecht.translate', 'auth.mock'));
//
//     beforeEach(angular.mock.module('pascalprecht.translate', function ($translateProvider) {
//         $translateProvider.translations('en', {
//             TESTS_ROADMAP: {
//                 TESTS_FULL_TITLE: 'Full Tests',
//                 TESTS_MINI_TITLE: 'Mini Tests'
//             }
//         });
//     }));
//
//     var $rootScope, $compile, $controller;
//     beforeEach(inject([
//         '$injector',
//         function ($injector) {
//             $rootScope = $injector.get('$rootScope');
//             $compile = $injector.get('$compile');
//             $controller = $injector.get('$controller');
//         }
//     ]));
//
//     var exams = [
//         {
//             id: 39,
//             name: 'Test 1',
//             order: 0,
//             sections: [],
//             typeId: 0
//         },
//         {
//             id: 45,
//             name: 'Mini Test 1',
//             order: 0,
//             sections: [],
//             typeId: 1
//         },
//         {
//             id: 52,
//             name: 'Test 2',
//             order: 0,
//             sections: [],
//             typeId: 0
//         },
//         {
//             id: 34,
//             name: 'Mini Test 2',
//             order: 0,
//             sections: [],
//             typeId: 1
//         }
//     ];
//
//     var examsResultsNull = [
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         }
//     ];
//
//     var examsResultsIsCompleted = [
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             isComplete: true
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         }
//     ];
//
//     var titles = "{ mini: \'.TESTS_MINI_TITLE\', full: \'.TESTS_FULL_TITLE\' }";
//
//     // added data option for this directive to simulate diffren binds for each test
//     function createDirectiveHtml(data, contentObj, $scopeObj, ctrlObj) {
//         if (!$scopeObj) {
//             $scopeObj = $rootScope.$new();
//             angular.extend($scopeObj, data);
//         }
//
//         if (!contentObj) {
//             contentObj = '<navigation-pane exams="exams" exams-results="examsResults" on-exam-click="onExamClick(exam)" titles="{ mini: \'.TESTS_MINI_TITLE\', full: \'.TESTS_FULL_TITLE\' }"></navigation-pane>';
//         }
//
//         contentObj = $compile(contentObj)($scopeObj);
//
//         if (!ctrlObj) {
//             ctrlObj = $controller('NavigationPaneController', {
//                 $scope: $scopeObj
//             }, data);
//         }
//
//         $scopeObj.$digest();
//
//         return {
//             scope: $scopeObj,
//             content: contentObj,
//             ctrl: ctrlObj
//         };
//     }
//
//     it('should have a property called vm', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function (exam) {
//                 expect(exam).toEqual(jasmine.any(Object));
//             }
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl).toBeDefined();
//     });
//
//     it('should take the exams and exams results then create on vm an exam object with two arrays: fullExams and miniExams', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl.activeId).toEqual(45);
//         expect(ctrl.exams.fullExams).toEqual(jasmine.any(Array));
//         expect(ctrl.exams.miniExams).toEqual(jasmine.any(Array));
//         expect(ctrl.exams.fullExams.length).toEqual(2);
//         expect(ctrl.exams.miniExams.length).toEqual(2);
//         angular.forEach(ctrl.exams.fullExams, function (exam) {
//             expect(exam.isCompleted).toEqual(false);
//         });
//         angular.forEach(ctrl.exams.miniExams, function (exam) {
//             expect(exam.isCompleted).toEqual(false);
//         });
//     });
//
//     it('should take the exams and exams results then create on vm an exam object with two arrays: fullExams and miniExams', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsIsCompleted,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl.activeId).toEqual(34);
//         expect(ctrl.exams.miniExams[0].isCompleted).toEqual(true);
//         expect(ctrl.exams.miniExams[1].isCompleted).toEqual(false);
//         angular.forEach(ctrl.exams.fullExams, function (exam) {
//             expect(exam.isCompleted).toEqual(false);
//         });
//     });
//
//     it('when invoke changeActive with new id the activeId should change', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl.activeId).toEqual(45);
//         ctrl.changeActive(10);
//         expect(ctrl.activeId).toEqual(10);
//     });
//
//     it('when all exams are not completed, the status-icon-wrapper should not appear, 4 md-list-item should be present', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item').length).toBe(4);
//         expect(content[0].querySelectorAll('.status-icon-wrapper').length).toBe(0);
//     });
//
//     it('when one exam are completed, the status-icon-wrapper should appear once, 4 md-list-item should be present', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsIsCompleted,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item').length).toBe(4);
//         expect(content[0].querySelectorAll('.status-icon-wrapper').length).toBe(1);
//     });
//
//     it('when all exams are not completed, the active class should be on the first full test', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item')[1].classList.contains('active')).toBe(false);
//         expect(content[0].querySelectorAll('md-list-item')[0].classList.contains('active')).toBe(true);
//     });
//
//     it('when one exam are completed, the done class should be on the first full test', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsIsCompleted,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item')[1].classList.contains('done')).toBe(false);
//         expect(content[0].querySelectorAll('md-list-item')[0].classList.contains('done')).toBe(true);
//     });
// });

angular.module('znk.infra-web-app.tests').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/tests/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"tests-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .tests-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/tests/svg/locked-icon.svg",
    "<svg class=\"tests-locked-icon-svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 106 165.2\" version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .tests-locked-icon-svg .st0{fill:none;stroke:#ffffff;stroke-width:6;stroke-miterlimit:10;}\n" +
    "        .tests-locked-icon-svg .st1{fill:none;stroke:#ffffff;stroke-width:4;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "	<path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/tests/svg/subject-locked-icon.svg",
    "<svg\n" +
    "    class=\"tests-subject-locked-icon\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 127.4 180\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .tests-subject-locked-icon .st0 {}\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<path class=\"st0\" d=\"M57.4,0c4,0,8,0,12,0c1.3,0.4,2.5,0.8,3.8,1.1c20,4.5,34.7,15.3,40.5,35.6c2.1,7.5,2.1,15.8,2.4,23.7\n" +
    "			c0.4,9.1,0.1,18.2,0.1,27.3c4.1,0.5,7.7,1,11.2,1.4c0,30.3,0,60.7,0,91C85,180,42.6,180,0,180c0-30.9,0-61.1,0-91.6\n" +
    "			c3.7-0.2,7.1-0.4,10.7-0.6c0-12.2-0.2-23.8,0-35.5c0.4-21.6,10-37.7,29.7-46.9C45.8,2.9,51.8,1.8,57.4,0z M98.5,87.9\n" +
    "			c0-11.5,0-22.5,0-33.4c0-20.3-9.9-32.2-30-36.1C52,15.2,32.1,26.9,29.8,43c-2,14.7-1.4,29.8-1.9,44.9\n" +
    "			C51.9,87.9,74.9,87.9,98.5,87.9z M71.3,149.8c-0.6-4.1-1.2-7.7-1.6-11.4c-0.5-4-1.3-7.7,2.1-11.5c3.2-3.6,1.7-9.3-2.1-12.4\n" +
    "			c-3.5-2.9-8.9-2.9-12.4,0c-3.8,3.1-5.4,8.9-2.2,12.4c3.5,3.9,2.5,7.8,2,12c-0.4,3.6-1,7.1-1.5,10.9\n" +
    "			C60.9,149.8,65.9,149.8,71.3,149.8z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/tests/templates/navigationPane.template.html",
    "<div class=\"app-tests-navigationPane\">\n" +
    "   <div class=\"tests-navigation-title-header\" translate=\"{{::vm.title}}\"></div>\n" +
    "    <md-list flex=\"grow\" layout=\"column\" layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"miniExam in vm.exams.miniExams\"\n" +
    "                      ng-class=\"{ 'done': miniExam.isCompleted, 'active': vm.activeId === miniExam.id }\">\n" +
    "            <md-button md-no-ink ng-click=\"vm.onExamClick({exam: miniExam, prevExam: vm.exams.miniExams[$index - 1]}); vm.changeActive(miniExam.id)\">\n" +
    "                {{::miniExam.name}}\n" +
    "                <div class=\"status-icon-wrapper\" ng-if=\"miniExam.isCompleted\">\n" +
    "                    <i class=\"material-icons\">check</i>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "    <md-list class=\"md-list-second-list\" flex=\"grow\" layout=\"column\" layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"fullExam in vm.exams.fullExams\"\n" +
    "                      ng-class=\"{ 'done': fullExam.isCompleted, 'active': vm.activeId === fullExam.id }\">\n" +
    "            <md-button md-no-ink ng-click=\"vm.onExamClick({exam: fullExam, prevExam: vm.exams.fullExams[$index - 1]}); vm.changeActive(fullExam.id)\">\n" +
    "                {{::fullExam.name}}\n" +
    "                <div class=\"status-icon-wrapper\" ng-if=\"fullExam.isCompleted\">\n" +
    "                    <i class=\"material-icons\">check</i>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/tests/templates/testsRoadmap.template.html",
    "<div class=\"app-tests-roadmap\" layout=\"row\" flex=\"grow\" translate-namespace=\"TESTS_ROADMAP\">\n" +
    "    <div class=\"app-navigation-container base-border-radius base-box-shadow\">\n" +
    "        <navigation-pane\n" +
    "            active-exam=\"vm.activeExamId\"\n" +
    "            exams=\"vm.exams\"\n" +
    "            exams-results=\"vm.examsResults\"\n" +
    "            on-exam-click=\"vm.onExamClick(exam, prevExam)\"\n" +
    "            title=\".TESTS_TITLE\">\n" +
    "        </navigation-pane>\n" +
    "    </div>\n" +
    "    <div class=\"app-tests-test-container base-border-radius base-box-shadow\">\n" +
    "\n" +
    "        <div class=\"main-title\">{{vm.currentExam.name}}</div>\n" +
    "\n" +
    "        <div class=\"inner base-border-radius animate-if\" ng-if=\"vm.testsReady\" ng-class=\"{'blurred': vm.overlayType}\">\n" +
    "            <div class=\"exam-composite-score\" translate=\".TESTS_TOTAL_SCORE\" translate-values=\"{score: vm.scores.totalScore || '-'}\"></div>\n" +
    "            <div class=\"flex-container\">\n" +
    "                <div class=\"subject-container\"\n" +
    "                     ng-repeat=\"subjectEnum in vm.subjectEnum\"\n" +
    "                     ng-class=\"{'math': subjectEnum.enum === vm.subjectEnum.MATH.enum, 'essay': subjectEnum.enum === vm.subjectEnum.ESSAY.enum }\">\n" +
    "                    <div class=\"subject-name\">{{subjectEnum.val}}</div>\n" +
    "                    <div class=\"section-test-score\" translate=\".TESTS_SECTION_SCORE\" translate-values=\"{score: vm.scores.sectionsScore[subjectEnum.enum] || '-' }\"></div>\n" +
    "                    <div class=\"subject-box-container\">\n" +
    "                        <div class=\"subject-box flex-item base-border-radius\"\n" +
    "                             ng-repeat=\"subjectBox in vm.currentExam.sections | filter : {'subjectId': subjectEnum.enum} track by subjectBox.id\">\n" +
    "                            <div class=\"subject-box-test-score\" translate=\".TESTS_SECTION_TEST_SCORE\"\n" +
    "                                 translate-values=\"{score: vm.scores.testsScore[subjectBox.categoryId] || '-' }\"></div>\n" +
    "                            <div class=\"subject-box-inner base-border-radius\" ng-click=\"vm.onSubjectClick(subjectBox)\"\n" +
    "                                 ng-class=\"{ 'loading': vm.loading, 'done': subjectBox.isComplete, 'lock': !subjectBox.isAvail,\n" +
    "                                 'progress': !subjectBox.isComplete && subjectBox.startedTime }\">\n" +
    "                                <header subject-id-to-class-drv=\"subjectBox.subjectId\" class-suffix=\"-bg\">\n" +
    "\n" +
    "                                    <div class=\"pattern\"\n" +
    "                                         subject-id-to-attr-drv=\"subjectBox.subjectId\"\n" +
    "                                         context-attr=\"class\"\n" +
    "                                         prefix=\"subject-background\">\n" +
    "                                    </div>\n" +
    "\n" +
    "                                    <div class=\"icon-wrapper-round\">\n" +
    "                                        <div class=\"math-no-calc\" ng-if=\"!subjectBox.calculator && subjectBox.subjectId === vm.subjectEnum.MATH.enum\"></div>\n" +
    "                                        <svg-icon name=\"{{vm.getTestIconName(subjectBox.categoryId)}}\"\n" +
    "                                                  class=\"icon-wrapper\">\n" +
    "                                        </svg-icon>\n" +
    "                                    </div>\n" +
    "\n" +
    "                                    <svg-icon name=\"tests-subject-locked-icon\"></svg-icon>\n" +
    "                                </header>\n" +
    "\n" +
    "                                <content>\n" +
    "\n" +
    "                                    <div class=\"question-count\" translate=\".TESTS_QUESTIONS\" translate-values=\"{questionCount: subjectBox.questionCount}\"></div>\n" +
    "                                    <div class=\"section-correct\" translate=\".TESTS_CORRECT\"\n" +
    "                                         translate-values=\"{correct: subjectBox.correctQuestionsNumber, questionsNum: subjectBox.questionCount }\">\n" +
    "                                    </div>\n" +
    "\n" +
    "\n" +
    "                                    <div class=\"progress-bar-wrap\">\n" +
    "                                        <div class=\"progress-bar base-border-radius\">\n" +
    "                                            <div class=\"progress-bar-inner\"\n" +
    "                                                 role=\"progressbar\"\n" +
    "                                                 ng-style=\"{'width': (subjectBox.answersNumber / subjectBox.questionCount) * 100 + '%'}\"></div>\n" +
    "                                            <span class=\"answered-count\">{{subjectBox.answersNumber}}</span>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "\n" +
    "                                    <div class=\"completed-box\">\n" +
    "                                        <svg-icon class=\"tests-check-mark-icon\" name=\"tests-check-mark-icon\"></svg-icon>\n" +
    "                                        <span class=\"completed-text\" translate=\".TESTS_COMPLETED\"></span>\n" +
    "                                    </div>\n" +
    "\n" +
    "                                </content>\n" +
    "\n" +
    "                                <footer>\n" +
    "                                    <div class=\"section-time\">\n" +
    "                                        <svg-icon class=\"icon-wrapper\" name=\"clock-icon\"></svg-icon>{{subjectBox.time - subjectBox.duration | timeFilter:'customMin'}}\n" +
    "                                        <span translate=\".TESTS_MIN\"></span>\n" +
    "                                    </div>\n" +
    "                                    <div ng-if=\"subjectBox.avgTimePerQuestion\" class=\"section-avg-time\"\n" +
    "                                         translate=\".AVG_TIME_FOR_COMPLETED_SUBJECT\"\n" +
    "                                         translate-values=\"{avgTimeForCompletedSubject: subjectBox.avgTimePerQuestion}\"></div>\n" +
    "                                </footer>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"tests-inner-popup base-border-radius\" ng-if=\"vm.overlayType\" ng-switch=\"vm.overlayType\">\n" +
    "                <div class=\"tests-inner-popup-blurred\"></div>\n" +
    "                <div class=\"tests-inner-popup-upgrade\" ng-switch-when=\"upgrade\">\n" +
    "                    <svg-icon name=\"tests-locked-icon\" class=\"tests-locked-icon\"></svg-icon>\n" +
    "                    <div class=\"tests-upgrade-text-up\" translate=\".TESTS_POPUP_UPGRADE_TEXT_1\"></div>\n" +
    "                    <div class=\"tests-upgrade-text-down\" translate=\".TESTS_POPUP_UPGRADE_TEXT_2\"></div>\n" +
    "                    <div class=\"btn-wrap\">\n" +
    "                        <md-button class=\"md primary\" translate=\"UPGRADE\" aria-label=\"UPGRADE\" ng-click=\"vm.showPurchaseDialog()\">\n" +
    "                            <svg-icon name=\"dropdown-arrow-icon\"></svg-icon>\n" +
    "                        </md-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"tests-inner-popup-complete-section\" ng-switch-when=\"completeSection\">\n" +
    "                    <span translate=\".TESTS_POPUP_COMPLETE_SECTION_TEXT\"></span>\n" +
    "                </div>\n" +
    "                <div class=\"tests-inner-popup-complete-section\" ng-switch-when=\"diagnostic\">\n" +
    "                    <span translate=\".TESTS_POPUP_DIAGNOSTIC_TEXT\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"tests-sub-score base-border-radius animate-if\" ng-if=\"vm.currentExam.isComplete && vm.subScoreReady\">\n" +
    "            <div class=\"sub-score-header\">\n" +
    "                <div class=\"sub-score-title\" translate=\".TESTS_SUB_SCORE\"></div>\n" +
    "                <svg-icon name=\"info-icon\">\n" +
    "                    <md-tooltip md-direction=\"top\" class=\"tooltip-for-tests\">\n" +
    "                        <div translate=\".TESTS_SUB_SCORE_TOOLTIP\"></div>\n" +
    "                    </md-tooltip>\n" +
    "                </svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"sub-score-columns\">\n" +
    "                <div class=\"sub-score-column\">\n" +
    "                    <div class=\"sub-score-column-title\" translate=\".MATH\"></div>\n" +
    "                    <div class=\"sub-score-section\"\n" +
    "                         ng-repeat=\"subScore in vm.scores.subScores[vm.subjectEnum.MATH.enum]\">\n" +
    "                        <div class=\"sub-score-name\">{{subScore.name | limitTo: 20}}</div>\n" +
    "                        <div class=\"sub-score-sum\">{{subScore.sum}}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"sub-score-column\">\n" +
    "                    <div class=\"sub-score-column-title\" translate=\".VERBAL\"></div>\n" +
    "                    <div class=\"sub-score-section\"\n" +
    "                         ng-repeat=\"subScore in vm.scores.subScores[vm.subjectEnum.VERBAL.enum]\">\n" +
    "                        <div class=\"sub-score-name\">{{subScore.name | limitTo: 20}}</div>\n" +
    "                        <div class=\"sub-score-sum\">{{subScore.sum}}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"tests-sub-score tests-cross-test-score base-border-radius animate-if\" ng-if=\"vm.currentExam.isComplete && vm.crossTestScoreReady\">\n" +
    "            <div class=\"sub-score-header\">\n" +
    "                <div class=\"sub-score-title\" translate=\".TESTS_CROSS_TEST_SCORES\"></div>\n" +
    "                <svg-icon name=\"info-icon\">\n" +
    "                    <md-tooltip md-direction=\"top\" class=\"tooltip-for-tests\">\n" +
    "                        <div translate=\".TESTS_CROSS_TEST_SCORES_TOOLTIP\"></div>\n" +
    "                    </md-tooltip>\n" +
    "                </svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"sub-score-columns\">\n" +
    "                <div class=\"sub-score-column\">\n" +
    "                    <div class=\"sub-score-section\"\n" +
    "                         ng-repeat=\"crossTestScore in vm.scores.crossTestScores\">\n" +
    "                        <div class=\"sub-score-name\">{{crossTestScore.name | limitTo: 20}}</div>\n" +
    "                        <div class=\"sub-score-sum\">{{crossTestScore.sum}}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/tests/templates/testsSectionExercise.template.html",
    "<znk-exercise-header\n" +
    "    subject-id=\"vm.subjectId\"\n" +
    "    side-text=\"{{::vm.sideTextByExamType}}\"\n" +
    "    options=\"{ showQuit: true, showNumSlide: true, showDate: (vm.isSectionComplete) ? false : true }\"\n" +
    "    exercise-num=\"{{::vm.exerciseNum}}\"\n" +
    "    on-clicked-quit=\"vm.onClickedQuit()\"\n" +
    "    timer-data=\"baseZnkExerciseCtrl.timerData\"\n" +
    "    ng-model=\"baseZnkExerciseCtrl.currentIndex\"\n" +
    "    total-slide-num=\"{{::baseZnkExerciseCtrl.numberOfQuestions}}\">\n" +
    "</znk-exercise-header>\n" +
    "<znk-progress-linear-exercise\n" +
    "    ng-if=\"!vm.isSectionComplete\"\n" +
    "    start-time=\"baseZnkExerciseCtrl.startTime\"\n" +
    "    max-time=\"baseZnkExerciseCtrl.maxTime\"\n" +
    "    on-finish-time=\"baseZnkExerciseCtrl.onFinishTime()\"\n" +
    "    on-change-time=\"baseZnkExerciseCtrl.onChangeTime(passedTime)\">\n" +
    "</znk-progress-linear-exercise>\n" +
    "<znk-exercise\n" +
    "    questions=\"baseZnkExerciseCtrl.exercise.questions\"\n" +
    "    ng-model=\"baseZnkExerciseCtrl.resultsData.questionResults\"\n" +
    "    settings=\"baseZnkExerciseCtrl.settings\"\n" +
    "    actions=\"baseZnkExerciseCtrl.actions\">\n" +
    "</znk-exercise>\n" +
    "");
  $templateCache.put("components/tests/templates/testsSectionIntro.template.html",
    "<div class=\"exercise-container base-border-radius base-box-shadow\">\n" +
    "    <znk-exercise-header\n" +
    "        subject-id=\"vm.subjectId\"\n" +
    "        side-text=\"{{::vm.sideTextByExamType}}\"\n" +
    "        category-id=\"vm.categoryId\"\n" +
    "        options=\"{ showQuit: true }\"\n" +
    "        exercise-num=\"{{::vm.exerciseNum}}\"\n" +
    "        on-clicked-quit=\"vm.onClickedQuit()\">\n" +
    "    </znk-exercise-header>\n" +
    "    <div class=\"test-section-intro-main\"\n" +
    "         subject-id-to-attr-drv=\"vm.subjectId\"\n" +
    "         context-attr=\"class\"\n" +
    "         prefix=\"test-intro\"\n" +
    "         translate-namespace=\"TEST_SECTION_INTRO\">\n" +
    "    <span class=\"test-section-intro-title\"\n" +
    "          translate=\"{{::vm.sideTextByExamType}}\"\n" +
    "          translate-values=\"{exerciseNum: {{::vm.exerciseNum}} }\"></span>\n" +
    "        <svg-icon subject-id-to-attr-drv=\"{{::vm.subjectId}}\"\n" +
    "                  context-attr=\"name\"\n" +
    "                  suffix=\"icon\"\n" +
    "                  class=\"icon-wrapper icon-subject\">\n" +
    "        </svg-icon>\n" +
    "    <span class=\"test-section-intro-subject-name\">\n" +
    "        {{::vm.testScoreIntroName}}\n" +
    "    </span>\n" +
    "        <div class=\"test-section-intro-subject-info\">\n" +
    "            <span class=\"test-section-intro-subject-info-questionCount\"\n" +
    "                  translate=\".SUBJECT_INFO_QUESTION_COUNT\"\n" +
    "                  translate-values=\"{ questionCount: {{vm.questionCount}} }\">\n" +
    "            </span>\n" +
    "            <span class=\"test-section-intro-subject-info-time\" translate=\".SUBJECT_INFO_TIME\"></span>\n" +
    "            <span>{{vm.time | timeFilter:'customMin'}}</span>\n" +
    "            <span translate=\".SUBJECT_INFO_MIN\"></span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"test-section-intro-instructions\">\n" +
    "            <span class=\"test-section-intro-instructions-title\" translate=\".INSTRUCTIONS_TITLE\"></span>\n" +
    "            <span class=\"test-section-intro-instructions-text\">{{::vm.testScoreInstructions}}</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <button autofocus tabindex=\"1\"\n" +
    "               class=\"md-button md primary\"\n" +
    "               translate=\".START\"\n" +
    "               aria-label=\"START\"\n" +
    "               ng-click=\"vm.goToExercise()\">\n" +
    "                <svg-icon name=\"dropdown-arrow-icon\"></svg-icon>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
