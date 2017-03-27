(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary', [
        'pascalprecht.translate',
        'chart.js',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.znkTimelineWebWrapper'
    ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryResults', {
        templateUrl: 'components/znkSummary/templates/znkSummaryResults.template.html',
        bindings: {
            exerciseResult: '<'
        },
        controller: function() {
            'ngInject';

            var PERCENTAGE = 100;

            var vm = this;

            var questionsLength = vm.exerciseResult.correctAnswersNum + vm.exerciseResult.wrongAnswersNum + vm.exerciseResult.skippedAnswersNum;

            vm.avgTime = {
                correctAvgTime: Math.round(vm.exerciseResult.correctAvgTime / 1000),
                wrongAvgTime: Math.round(vm.exerciseResult.wrongAvgTime / 1000),
                skippedAvgTime: Math.round(vm.exerciseResult.skippedAvgTime / 1000)
            };

            vm.gaugeSuccessRate = questionsLength > 0 ? Math.round((vm.exerciseResult.correctAnswersNum * PERCENTAGE) / questionsLength) : 0;

            vm.performenceChart = {
                labels: ['Correct', 'Wrong', 'Unanswered'],
                data: [vm.exerciseResult.correctAnswersNum, vm.exerciseResult.wrongAnswersNum, vm.exerciseResult.skippedAnswersNum],
                colours: ['#87ca4d', '#ff6766', '#ebebeb'],
                options: {
                    segmentShowStroke: false,
                    percentageInnerCutout: 85,
                    showTooltips: false,
                    animation: false
                }
            };
        },
        controllerAs: 'vm'
    });
})(angular);



(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryTimeline', {
        templateUrl: 'components/znkSummary/templates/znkSummaryTimeline.template.html',
        bindings: {
            exerciseData: '<'
        },
        controller: ["SubjectEnum", function(SubjectEnum) {
            'ngInject';

            var vm = this;

            vm.seenSummary = vm.exerciseData.exerciseResult.seenSummary;
            vm.currentSubjectId = vm.exerciseData.exerciseResult.subjectId;
            vm.activeExerciseId = vm.exerciseData.exerciseResult.exerciseId;

            vm.subjectName = SubjectEnum.getValByEnum(vm.currentSubjectId);
        }],
        controllerAs: 'vm'
    });
})(angular);


angular.module('znk.infra-web-app.znkSummary').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkSummary/templates/znkSummaryResults.template.html",
    "<div class=\"gauge-row-wrapper\" translate-namespace=\"ZNK_SUMMARY\">\n" +
    "    <div class=\"overflowWrap\">\n" +
    "        <div class=\"gauge-wrap\">\n" +
    "            <div class=\"gauge-inner-text\">{{::vm.gaugeSuccessRate}}%\n" +
    "                <div class=\"success-title\" translate=\".SUCCESS\"></div>\n" +
    "            </div>\n" +
    "            <canvas\n" +
    "                id=\"doughnut\"\n" +
    "                class=\"chart chart-doughnut\"\n" +
    "                chart-options=\"vm.performenceChart.options\"\n" +
    "                chart-colours=\"vm.performenceChart.colours\"\n" +
    "                chart-data=\"vm.performenceChart.data\"\n" +
    "                chart-labels=\"vm.performenceChart.labels\"\n" +
    "                chart-legend=\"false\">\n" +
    "            </canvas>\n" +
    "        </div>\n" +
    "        <div class=\"statistics\">\n" +
    "            <div class=\"stat-row\">\n" +
    "                <div class=\"stat-val correct\">{{::vm.exerciseResult.correctAnswersNum}}</div>\n" +
    "                <div class=\"title\" translate=\".CORRECT\"></div>\n" +
    "                <div class=\"avg-score\"><span translate=\".AVG\"></span>. {{::vm.avgTime.correctAvgTime}} <span translate=\".SEC\"></span> </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"stat-row\">\n" +
    "                <div class=\"stat-val wrong\">{{::vm.exerciseResult.wrongAnswersNum}}</div>\n" +
    "                <div class=\"title\" translate=\".WRONG\"></div>\n" +
    "                <div class=\"avg-score\"><span translate=\".AVG\"></span>. {{::vm.avgTime.wrongAvgTime}} <span translate=\".SEC\"></span></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"stat-row\">\n" +
    "                <div class=\"stat-val skipped\">{{::vm.exerciseResult.skippedAnswersNum}}</div>\n" +
    "                <div class=\"title\" translate=\".SKIPPED\"></div>\n" +
    "                <div class=\"avg-score\"><span translate=\".AVG\"></span>. {{::vm.avgTime.skippedAvgTime}}  <span translate=\".SEC\"></span></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkSummary/templates/znkSummaryTimeline.template.html",
    "<div class=\"time-line-wrapper\" translate-namespace=\"ZNK_SUMMARY\"\n" +
    "     ng-class=\"{'seen-summary': vm.seenSummary}\">\n" +
    "    <div class=\"estimated-score-title\">\n" +
    "        <span translate=\"SUBJECTS.{{vm.currentSubjectId}}\">\n" +
    "        </span>\n" +
    "        <span translate=\".ESTIMATED_SCORE\">\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <znk-timeline-web-wrapper\n" +
    "        subject-id=\"{{::vm.currentSubjectId}}\"\n" +
    "        show-induction=\"true\"\n" +
    "        active-exercise-id=\"::vm.activeExerciseId\">\n" +
    "    </znk-timeline-web-wrapper>\n" +
    "</div>\n" +
    "");
}]);
