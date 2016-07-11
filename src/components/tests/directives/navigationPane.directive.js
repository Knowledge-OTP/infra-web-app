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
                    //init
                    ExamSrv.getAllExams().then(function(examArr){
                        var _examArr = [];
                        var getExamResultPromArr = [];

                        angular.forEach(examArr, function (exam) {
                            var examCopy = angular.copy(exam);
                            _examArr.push(examCopy);

                            var getExamResultProm = ExerciseResultSrv.getExamResult(exam.id, true).then(function(examResult){
                                examCopy.isCompleted = !!(examResult && examResult.isCompleted);
                            });

                            getExamResultPromArr.push(getExamResultProm);
                        });
                        //set active exam id
                        $q.all(getExamResultPromArr).then(function(){
                            var activeExamId;

                            for(var i=0; i<_examArr.length; i++){
                                var exam = _examArr[i];

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
                                activeExamId = _examArr[0].id;
                            }

                            scope.vm.changeActive(activeExamId);
                        });

                        scope.vm.examArr = _examArr;
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

