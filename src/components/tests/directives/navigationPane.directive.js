/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        function ($translatePartialLoader, ExamTypeEnum, $log, ExamSrv, ExerciseResultSrv, $q) {
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
                    var self = scope.vm;
                    debugger;
                    var allExamsProm = ExamSrv.getAllExams(true);

                    $q.when([
                        allExamsProm
                    ]).then(function (res) {
                        var examsProm = res[0];
                        $q.when(examsProm).then(function (res) {
                            var examsArr = res;
                            var examResultsProms = [];
                            angular.forEach(examsArr, function (exam) {
                                examResultsProms.push(ExerciseResultSrv.getExamResult(exam.id, true));
                            });
                            $q.all(examResultsProms).then(function (res) {
                                self.exams = examsArr;
                                self.examsResults = res;


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
                                            self.onExamClick({exam: currentValue, prevExam: prevContent[currentIndex - 1]});
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
                                            self.onExamClick({exam: examsType[i], prevExam: examsType[i - 1]});
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
                                        self.onExamClick({exam: exams.miniExams[0], prevExam: void(0)});
                                    }
                                }

                                // self.changeActive = function (id) {
                                //     if (id !== self.activeId) {
                                //         self.activeId = id;
                                //     }
                                // };

                                self.changeActive = function (subjectId) {
                                    if (subjectId !== self.activeId) {
                                        ngModelCtrl.$setViewValue(+subjectId);
                                        self.activeId = subjectId;
                                    }
                                };

                                ngModelCtrl.$render = function () {
                                    self.activeId = '' + ngModelCtrl.$viewValue;
                                };

                                self.exams = _filterExams();
                            })
                        });
                    });
                }
            };
        }
    );
})(angular);

