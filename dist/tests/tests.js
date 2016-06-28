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

// (function (angular) {
//     'use strict';
//
//     angular.module('znk.infra-web-app.tests').config([
//         '$stateProvider',
//         function ($stateProvider) {
//             $stateProvider
//                 .state('app.tests', {
//                     url: '/tests',
//                     template: '<ui-view></ui-view>'
//                 })
//                 .state('app.tests.roadmap', {
//                     url: '/roadmap?exam',
//                     templateUrl: 'components/tests/templates/testsRoadmap.template.html',
//                     resolve: {
//                         testsData: function (ExamSrv, ExerciseResultSrv, $q) {
//                             return ExamSrv.getAllExams(true).then(function (exams) {
//                                 var examResultsProms = [];
//                                 angular.forEach(exams, function (exam) {
//                                     examResultsProms.push(ExerciseResultSrv.getExamResult(exam.id, true));
//                                 });
//                                 return $q.all(examResultsProms).then(function (examsResults) {
//                                     return {
//                                         exams: exams,
//                                         examsResults: examsResults
//                                     };
//                                 });
//                             });
//                         },
//                         diagnosticData: function (DiagnosticSrv) {
//                              DiagnosticSrv.getDiagnosticStatus().then(function (result) {
//                                  var isDiagnosticsComplete = result === 2;
//                                 return (isDiagnosticsComplete) ? isDiagnosticsComplete : false;
//                             });
//                             // return DiagnosticSrv.getDiagnosticStatus().then(function (result) {
//                             //     return (result.isComplete) ? result.isComplete : false;
//                             // });
//                         }
//                     },
//                     controller: 'TestsRoadmapController',
//                     controllerAs: 'vm'
//                 })
//                 .state('app.tests.section', {
//                     url: '/section/:examId/:sectionId',
//                     template: '<ui-view></ui-view>',
//                     controller: 'WorkoutsWorkoutController',
//                     resolve: {
//                         exerciseData: function exerciseData($q, ExamSrv, $stateParams, ExerciseTypeEnum, ExerciseResultSrv, $state, $filter) {
//                             var examId = +$stateParams.examId;
//                             var sectionId = +$stateParams.sectionId;
//                             var getSectionProm = ExamSrv.getExamSection(sectionId);
//                             var getExam = ExamSrv.getExam(examId);
//                             var getExamResultProm = ExerciseResultSrv.getExamResult(examId);
//                             return $q.all([getExam, getExamResultProm]).then(function (results) {
//                                 var examExercise = results[0];
//                                 var examResultsExercise = results[1];
//                                 var getExerciseResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examId, examExercise.sections.length);
//                                 return {
//                                     headerTitlePrefix: $filter('translate')('TEST_TEST.SECTION'),
//                                     exerciseProm: getSectionProm,
//                                     exerciseResultProm: getExerciseResultProm,
//                                     exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
//                                     examData: examExercise,
//                                     examResult: examResultsExercise,
//                                     headerExitAction: function () {
//                                         $state.go('app.tests.roadmap', {exam: $stateParams.examId});
//                                     }
//                                 };
//                             });
//                         }
//                     },
//                     controllerAs: 'vm'
//                 })
//                 .state('app.tests.section.intro', {
//                     templateUrl: 'components/tests/templates/testsSectionIntro.template.html',
//                     controller: 'TestsSectionIntroController',
//                     controllerAs: 'vm'
//                 });
//                 /*.state('app.tests.section.exercise', {
//                     views: {
//                         '@app': {
//                             templateUrl: 'app/workouts/templates/workoutsWorkoutExercise.template.html',
//                             controller: 'WorkoutsWorkoutExerciseController',
//                             controllerAs: 'vm'
//                         }
//                     },
//                     onExit: function (exerciseData) {
//                         if (angular.isDefined(exerciseData.resultsData)) {
//                             exerciseData.resultsData.$save();
//                         }
//                     }
//                 })
//                 .state('app.tests.section.summary', {
//                     views: {
//                         '@app': {
//                             templateUrl: 'app/workouts/templates/workoutsWorkoutSummary.template.html',
//                             controller: 'WorkoutsWorkoutSummaryController',
//                             controllerAs: 'vm'
//                         }
//                     }
//                 });*/
//         }]);
// })(angular);

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

    angular.module('znk.infra-web-app.tests').provider('TestsSrv', [
        function () {
            var _subjectsMapGetter;

            this.setSubjectsMap = function (subjectsMapGetter) {
                _subjectsMapGetter = subjectsMapGetter;
            };

            this.$get = function ($log, $injector, $q, ExerciseResultSrv, ExamSrv, ScoringService, ExerciseTypeEnum) {
                'ngInject';

                var TestsSrv = {};

                TestsSrv.getSubjectsMap = function () {
                    if (!_subjectsMapGetter) {
                        var errMsg = 'TestsSrv: subjectsMapGetter was not set.';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }
                    return $q.when($injector.invoke(_subjectsMapGetter));
                };

                TestsSrv.getExamResult = function (examsResults, examId) {
                    return examsResults.filter(function (examsResult) {
                        return examsResult && +examsResult.examId === +examId;
                    });
                };

                TestsSrv.getExamSection = function (exam, sectionId) {
                    var examSection;
                    for (var i = 0, ii = exam.sections.length; i < ii; i++) {
                        if (exam.sections[i].id === sectionId) {
                            examSection = exam.sections[i];
                            break;
                        }
                    }
                    return examSection;
                };

                TestsSrv.isAllSubjectLocked = function (exam) {
                    var isAvail = true;
                    for (var i = 0, ii = exam.sections.length; i < ii; i++) {
                        if (exam.sections[i].isAvail) {
                            isAvail = false;
                            break;
                        }
                    }
                    return isAvail;
                };

                TestsSrv.filterArrByCategoryId = function (arr, id) {
                    return arr.filter(function (result) {
                        return +result.categoryId !== id;
                    });
                };

                TestsSrv.getExerciseIdByCategoryId = function (arr, id) {
                    var exerciseId;
                    for (var i = 0, ii = arr.length; i < ii; i++) {
                        if (arr[i].categoryId === id) {
                            exerciseId = arr[i].id;
                            break;
                        }
                    }
                    return exerciseId;
                };

                TestsSrv.getExamsAndExerciseResults = function (examCopy, examResults) {
                    var examResult = examResults[0];
                    var sectionResults = Object.keys(examResult.sectionResults);
                    var exerciseResultsProms = [];
                    var examSectionProms = [];
                    angular.forEach(sectionResults, function (sectionId) {
                        sectionId = +sectionId;
                        exerciseResultsProms.push(ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examCopy.id, null, true));
                        examSectionProms.push(TestsSrv.getExamSection(examCopy, sectionId));
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

                var subjectOrderProm = TestsSrv.getSubjectsMap();

                TestsSrv.getFullExamSubAndCrossScores = function (sections, sectionsResults) {
                    $q.when(subjectOrderProm).then(function (res) {
                        var subjectsOrder = res;
                        var essayEnum;
                        for (var i = 0; i < subjectsOrder.subjects.length; i++) {
                            if (subjectsOrder.subjects[i].id === 8) {
                                essayEnum = subjectsOrder.subjects[i].id;
                            }
                        }
                        var essayExerciseId = TestsSrv.getExerciseIdByCategoryId(sections, essayEnum);
                        var newSections = TestsSrv.filterArrByCategoryId(sections, essayEnum);
                        var newSectionsResults = sectionsResults.filter(function (sectionResult) {
                            return +sectionResult.exerciseId !== essayExerciseId;
                        });
                        return ScoringService.getFullExamSubAndCrossScores(newSections, newSectionsResults);
                    });
                };

                TestsSrv.isTypeFull = function (typeId) {
                    return ScoringService.isTypeFull(typeId);
                };

                TestsSrv.groupBySubjectId = function (obj) {
                    var newObj = {};
                    angular.forEach(obj, function (value) {
                        if (!newObj[value.subjectId]) {
                            newObj[value.subjectId] = [];
                        }
                        newObj[value.subjectId].push(value);
                    });
                    return newObj;
                };

                TestsSrv.isSectionInPrevExamCompleted = function (prevExam) {
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
                return TestsSrv;
            };
        }
    ]);
})(angular);

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
}]);
