/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        function ($translatePartialLoader, ExamTypeEnum, ExamSrv, ExerciseResultSrv, $q) {
            'ngInject';
            return {
                scope: {},
                restrict: 'E',
                templateUrl: 'components/tests/templates/navigationPane.template.html',
                require: '?ngModel',
                link: function (scope, element, attributes, ngModelCtrl) {
                    $translatePartialLoader.addPart('tests');

                    scope.vm = {};

                    scope.vm.ExamTypeEnum = ExamTypeEnum;

                    ExamSrv.getAllExams().then(function(examsArr){
                        var examArr = [];
                        var getExamResultPromArr = [];

                        angular.forEach(examsArr, function (exam) {
                            var examCopy = angular.copy(exam);
                            examArr.push(examCopy);

                            var getExamResultProm = ExerciseResultSrv.getExamResult(exam.id, true).then(function(examResult){
                                examCopy.isCompleted = !!(examResult && examResult.isCompleted);
                            });

                            getExamResultPromArr.push(getExamResultProm);
                        });
                        //set active exam id
                        $q.all(getExamResultPromArr).then(function(){
                            var activeExamId;

                            for(var i=0; i<examArr.length; i++){
                                var exam = examArr[i];

                                if(exam.typeId === ExamTypeEnum.MINI_TEST.enum){
                                    activeExamId = exam.id;
                                    break;
                                }
                                //active exam id is already set with higher order full test
                                if(angular.isDefined(activeExamId)){
                                    continue;
                                }

                                activeExamId = exam.id;
                            }
                            //all exams are completed
                            if(angular.isUndefined(activeExamId)){
                                activeExamId = examArr[0].id;
                            }

                            scope.vm.changeActive(activeExamId);
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

