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
    ])
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'tests-check-mark-icon': 'components/tests/svg/check-mark-icon.svg',
                'tests-locked-icon': 'components/tests/svg/locked-icon.svg',
                'tests-subject-locked-icon': 'components/tests/svg/subject-locked-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        ["$translatePartialLoader", "ExamTypeEnum", "ExamSrv", "ExerciseResultSrv", function ($translatePartialLoader, ExamTypeEnum, ExamSrv, ExerciseResultSrv) {
            'ngInject';
            return {
                scope: {
                    activeExam: '=?',
                    onExamClick: '&'
                },
                restrict: 'E',
                templateUrl: 'components/tests/templates/navigationPane.template.html',
                require: '?ngModel',
                link: function (scope, element, attributes, ngModelCtrl) {
                    $translatePartialLoader.addPart('tests');

                    scope.vm = {};

                    scope.vm.ExamTypeEnum = ExamTypeEnum;

                    ExamSrv.getAllExams().then(function(examsArr){
                        var examArr = [];

                        angular.forEach(examsArr, function (exam) {
                            var examCopy = angular.copy(exam);
                            examArr.push(examCopy);

                            ExerciseResultSrv.getExamResult(exam.id, true).then(function(examResult){
                                examCopy.isCompleted = !!(examResult && examResult.isCompleted);
                            });
                        });

                        scope.vm.examArr = examArr;
                    });

                    scope.vm.changeActive = function(newActiveId){
                        scope.vm.activeId = newActiveId;
                        ngModelCtrl.$setViewValue(newActiveId);
                    };
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').filter('timeFilter',
        ["$filter", function ($filter) {
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
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').provider('TestsSrv', [
        function () {
            var _subjectsOrderGetter;

            this.setSubjectsOrder = function (subjectsOrderGetter) {
                _subjectsOrderGetter = subjectsOrderGetter;
            };

            this.$get = ["$log", "$injector", "$q", "ExerciseResultSrv", "ExamSrv", "ScoringService", "ExerciseTypeEnum", function ($log, $injector, $q, ExerciseResultSrv, ExamSrv, ScoringService, ExerciseTypeEnum) {
                'ngInject';

                var TestsSrv = {};

                TestsSrv.getSubjectsOrder = function () {
                    if (!_subjectsOrderGetter) {
                        var errMsg = 'TestsSrv: subjectsMapGetter was not set.';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }
                    return $q.when($injector.invoke(_subjectsOrderGetter));
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

                TestsSrv.areAllSubjectsLocked = function (exam) {
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

                TestsSrv.groupBySubjectId = function (subject) {
                    var newObj = {};
                    angular.forEach(subject, function (value) {
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
            }];
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
    "<div class=\"app-tests-navigationPane\"\n" +
    "     translate-namespace=\"NAVIGATION_PANE\">\n" +
    "   <div class=\"tests-navigation-title-header\"\n" +
    "        translate=\".MINI_TEST_TITLE\"></div>\n" +
    "    <md-list flex=\"grow\" layout=\"column\" layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"miniExam in vm.examArr | filter : {typeId: vm.ExamTypeEnum.MINI_TEST.enum}\"\n" +
    "                      ng-class=\"{\n" +
    "                        'done': miniExam.isCompleted,\n" +
    "                        'active': vm.activeId === miniExam.id\n" +
    "                      }\">\n" +
    "            <md-button md-no-ink\n" +
    "                       ng-click=\"vm.changeActive(miniExam.id)\">\n" +
    "                <span translate=\".TEST\"\n" +
    "                      translate-values=\"{testNumber: $index+1}\">\n" +
    "                </span>\n" +
    "                <div class=\"status-icon-wrapper\"\n" +
    "                     ng-if=\"miniExam.isCompleted\">\n" +
    "                    <i class=\"material-icons\">check</i>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "    <div class=\"tests-navigation-title-header\"\n" +
    "         translate=\".FULL_TEST_TITLE\"></div>\n" +
    "    <md-list class=\"md-list-second-list\"\n" +
    "             flex=\"grow\"\n" +
    "             layout=\"column\"\n" +
    "             layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"fullExam in vm.examArr | filter : {typeId: vm.ExamTypeEnum.FULL_TEST.enum}\"\n" +
    "                      ng-class=\"{\n" +
    "                        'done': fullExam.isCompleted,\n" +
    "                        'active': vm.activeId === fullExam.id\n" +
    "                      }\">\n" +
    "            <md-button md-no-ink\n" +
    "                       ng-click=\"vm.changeActive(fullExam.id)\">\n" +
    "                <span translate=\".TEST\"\n" +
    "                      translate-values=\"{testNumber: $index+1}\">\n" +
    "                </span>\n" +
    "                <div class=\"status-icon-wrapper\"\n" +
    "                     ng-if=\"fullExam.isCompleted\">\n" +
    "                    <i class=\"material-icons\">check</i>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "</div>\n" +
    "");
}]);
