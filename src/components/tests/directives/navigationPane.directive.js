/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        function (ExamTypeEnum, ExamSrv, ExerciseResultSrv, $q) {
            'ngInject';
            return {
                scope: {},
                restrict: 'E',
                templateUrl: 'components/tests/directives/navigationPane.template.html',
                require: '?ngModel',
                link: function (scope, element, attributes, ngModelCtrl) {

                    scope.vm = {};

                    scope.vm.ExamTypeEnum = ExamTypeEnum;
                    //init
                    ExamSrv.getAllExams().then(function(examArr){
                        var examsWithIsCompletedStatusArr = [];
                        var getExamResultPromArr = [];

                        angular.forEach(examArr, function (exam) {
                            var examCopy = angular.copy(exam);
                            examsWithIsCompletedStatusArr.push(examCopy);

                            var getExamResultProm = ExerciseResultSrv.getExamResult(exam.id, true).then(function(examResult){
                                examCopy.isCompleted = !!(examResult && examResult.isComplete);
                            });

                            getExamResultPromArr.push(getExamResultProm);
                        });
                        //set active exam id
                        $q.all(getExamResultPromArr).then(function(){
                            var activeExamId;

                            for(var i=0; i<examsWithIsCompletedStatusArr.length; i++){
                                var exam = examsWithIsCompletedStatusArr[i];

                                if(exam.isCompleted){
                                    continue;
                                }

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
                                activeExamId = examsWithIsCompletedStatusArr[0].id;
                            }

                            scope.vm.changeActive(activeExamId);
                        });

                        scope.vm.examArr = examsWithIsCompletedStatusArr;
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

