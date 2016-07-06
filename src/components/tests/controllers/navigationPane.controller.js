(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').controller('NavigationPaneController',
        function (ExamTypeEnum, $log, $translatePartialLoader, ExamSrv, ExerciseResultSrv, $q) {
            'ngInject';

            var self = this;
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

                self.changeActive = function (id) {
                    if (id !== self.activeId) {
                        self.activeId = id;
                    }
                };

                this.exams = _filterExams();
                    })
                });
            });
        }
    );
})(angular);
