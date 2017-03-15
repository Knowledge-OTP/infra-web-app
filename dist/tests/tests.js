(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests', [
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'ngMaterial',
        'znk.infra.enum',
        'znk.infra.scoring',
        'znk.infra.exams',
        'znk.infra-web-app.diagnostic',
        'znk.infra.analytics',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.estimatedScoreWidget',
        'znk.infra.exerciseUtility',
        'ui.router'
    ]);  
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        ["ExamTypeEnum", "ExamSrv", "ExerciseResultSrv", "$q", function (ExamTypeEnum, ExamSrv, ExerciseResultSrv, $q) {
            'ngInject';
            return {
                scope: {},
                restrict: 'E',
                templateUrl: 'components/tests/templates/navigationPane.template.html',
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
        }]
    );
})(angular);


angular.module('znk.infra-web-app.tests').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/tests/templates/navigationPane.template.html",
    "<div class=\"app-tests-navigationPane\"\n" +
    "     translate-namespace=\"NAVIGATION_PANE\">\n" +
    "    <div class=\"tests-navigation-title-header\"\n" +
    "         translate=\".MINI_TEST_TITLE\"></div>\n" +
    "    <md-list flex=\"grow\" layout=\"column\" layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"miniExam in vm.examArr | filter : {typeId: vm.ExamTypeEnum.MINI_TEST.enum} | orderBy:'order'\"\n" +
    "                      ng-class=\"{\n" +
    "                        'done': miniExam.isCompleted,\n" +
    "                        'active': vm.activeId === miniExam.id\n" +
    "                      }\">\n" +
    "            <md-button md-no-ink aria-label=\"{{'NAVIGATION_PANE.MINI_TEST_TITLE' | translate}}\"\n" +
    "                       ng-click=\"vm.changeActive(miniExam.id)\">\n" +
    "                <span>{{miniExam.name}}</span>\n" +
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
    "        <md-list-item ng-repeat=\"fullExam in vm.examArr | filter : {typeId: vm.ExamTypeEnum.FULL_TEST.enum} | orderBy:'order'\"\n" +
    "                      ng-class=\"{\n" +
    "                        'done': fullExam.isCompleted,\n" +
    "                        'active': vm.activeId === fullExam.id\n" +
    "                      }\">\n" +
    "            <md-button md-no-ink aria-label=\"{{'NAVIGATION_PANE.FULL_TEST_TITLE' | translate}}\"\n" +
    "                       ng-click=\"vm.changeActive(fullExam.id)\">\n" +
    "                <span>{{fullExam.name}}</span>\n" +
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
