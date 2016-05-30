(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').controller('WorkoutsDiagnosticSummaryController',
        function(diagnosticSummaryData, $filter, SubjectEnum, SubjectEnumConst) {
        'ngInject';

            var translateFilter = $filter('translate');

            var diagnosticScoresObj = diagnosticSummaryData.userStats;
            var goalScoreObj = diagnosticSummaryData.userGoals;
            var diagnosticResultObj = diagnosticSummaryData.diagnosticResult;
            var diagnosticCompositeScore = diagnosticSummaryData.compositeScore;
            var enumArrayMap = {};
            angular.forEach(SubjectEnum, function (enumObj) {
                enumArrayMap[enumObj.enum] = enumObj;
            });

            var MAX_SCORE = 36, GREAT_SCORE = 0, GOOD_SCORE = 1, BAD_SCORE = 2;
            var GOAL = 'Goal';
            var MAX = 'Max';

            var footerTextArr = [translateFilter('WORKOUTS_DIAGNOSTIC_SUMMARY.GREAT_START'),
                translateFilter('WORKOUTS_DIAGNOSTIC_SUMMARY.GOOD_START'),
                translateFilter('WORKOUTS_DIAGNOSTIC_SUMMARY.BAD_START')];

            if (!diagnosticResultObj.userStats) {
                diagnosticResultObj.userStats = diagnosticScoresObj;
                diagnosticResultObj.compositeScore = diagnosticCompositeScore;
                diagnosticResultObj.$save();
            }

            if (diagnosticResultObj.compositeScore > 24) {
                this.footerTranslatedTextArr = footerTextArr[GREAT_SCORE];
            } else if (diagnosticResultObj.compositeScore > 20) {
                this.footerTranslatedTextArr = footerTextArr[GOOD_SCORE];
            } else {
                this.footerTranslatedTextArr = footerTextArr[BAD_SCORE];
            }

            this.compositeScore = diagnosticResultObj.compositeScore;

            var doughnutValues = {};
            for (var subjectId in diagnosticResultObj.userStats) {
                if (diagnosticResultObj.userStats.hasOwnProperty(subjectId)) {
                    var subjectName = enumArrayMap[subjectId].val;
                    doughnutValues[subjectName] = diagnosticResultObj.userStats[subjectId];
                    doughnutValues[subjectName + GOAL] = goalScoreObj[subjectName] > diagnosticResultObj.userStats[subjectId] ? (goalScoreObj[subjectName] - diagnosticResultObj.userStats[subjectId]) : 0;
                    doughnutValues[subjectName + MAX] = MAX_SCORE - (doughnutValues[subjectName + GOAL] + diagnosticResultObj.userStats[subjectId]);
                }
            }

            function GaugeConfig(_subjectName, _subjectId, colorsArray) {
                this.labels = ['Correct', 'Wrong', 'Unanswered'];
                this.options = {
                    scaleLineWidth: 40,
                    percentageInnerCutout: 92,
                    segmentShowStroke: false,
                    animationSteps: 100,
                    animationEasing: 'easeOutQuint',
                    showTooltips: false
                };
                this.goalPoint = getGoalPoint(goalScoreObj[_subjectName]);
                this.data = [doughnutValues[_subjectName], doughnutValues[_subjectName + GOAL], doughnutValues[_subjectName + MAX]];
                this.colors = colorsArray;
                this.subjectName = translateFilter('WORKOUTS_DIAGNOSTIC_SUMMARY.' + angular.uppercase(_subjectName));
                this.score = diagnosticResultObj.userStats[_subjectId];
                this.scoreGoal = goalScoreObj[_subjectName];
            }

            function getGoalPoint(scoreGoal) {
                var degree = (scoreGoal / MAX_SCORE) * 360 - 90;    // 90 - degree offset
                var radius = 52.5;
                var x = Math.cos((degree * (Math.PI / 180))) * radius;
                var y = Math.sin((degree * (Math.PI / 180))) * radius;
                var xOffset = 105, yOffset = 49;
                x += xOffset;
                y += yOffset;
                return { x, y };
            }

            var dataArray = [];
            dataArray.push(new GaugeConfig(enumArrayMap[SubjectEnumConst.ENGLISH].val, enumArrayMap[SubjectEnumConst.ENGLISH].enum, ['#af89d2', '#c9c9c9', '#f3f3f3']));
            dataArray.push(new GaugeConfig(enumArrayMap[SubjectEnumConst.MATH].val, enumArrayMap[SubjectEnumConst.MATH].enum, ['#75cbe8', '#c9c9c9', '#f3f3f3']));
            dataArray.push(new GaugeConfig(enumArrayMap[SubjectEnumConst.READING].val, enumArrayMap[SubjectEnumConst.READING].enum, ['#f9d628', '#c9c9c9', '#f3f3f3']));
            dataArray.push(new GaugeConfig(enumArrayMap[SubjectEnumConst.SCIENCE].val, enumArrayMap[SubjectEnumConst.SCIENCE].enum, ['#51cdba', '#c9c9c9', '#f3f3f3']));

            this.getGoalPoint = getGoalPoint;
            this.doughnutArray = dataArray;
    });
})(angular);
