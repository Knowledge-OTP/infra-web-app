/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        function ($translatePartialLoader, ExamTypeEnum, ExamSrv, ExerciseResultSrv) {
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
        }
    );
})(angular);

