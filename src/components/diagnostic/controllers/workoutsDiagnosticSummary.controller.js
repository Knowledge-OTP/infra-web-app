(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').controller('WorkoutsDiagnosticSummaryController',
        function(diagnosticSummaryData, SubjectEnum, SubjectEnumConst) {
        'ngInject';

            var self = this;

            var diagnosticScoresObj = diagnosticSummaryData.userStats;
            var goalScoreObj = diagnosticSummaryData.userGoals;
            var diagnosticResultObj = diagnosticSummaryData.diagnosticResult;
            var diagnosticCompositeScore = diagnosticSummaryData.compositeScore;
            var enumArrayMap = {};
            angular.forEach(SubjectEnum, function (enumObj) {
                enumArrayMap[enumObj.enum] = enumObj;
            });

            var MAX_SCORE = 36;
            var GOAL = 'Goal';
            var MAX = 'Max';

            if (!diagnosticResultObj.userStats) {
                diagnosticResultObj.userStats = diagnosticScoresObj;
                diagnosticResultObj.compositeScore = diagnosticCompositeScore;
                diagnosticResultObj.$save();
            }

            if (diagnosticResultObj.compositeScore > 24) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GREAT_START';
            } else if (diagnosticResultObj.compositeScore > 20) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GOOD_START';
            } else {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.BAD_START';
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
                this.subjectName  =  'WORKOUTS_DIAGNOSTIC_SUMMARY.' + angular.uppercase(_subjectName);
                this.score = diagnosticResultObj.userStats[_subjectId];
                this.scoreGoal = goalScoreObj[_subjectName];
            }

            function getGoalPoint(scoreGoal) {
                var degree = (scoreGoal / MAX_SCORE) * 360 - 90;    // 90 - degree offset
                var radius = 52.5;
                var x = Math.cos((degree * (Math.PI / 180))) * radius;
                var y = Math.sin((degree * (Math.PI / 180))) * radius;
                x += 105;
                y += 49;
                return {
                    x: x,
                    y: y
                };
            }

            var dataArray = [];
            dataArray.push(new GaugeConfig(enumArrayMap[SubjectEnumConst.MATH].val, enumArrayMap[SubjectEnumConst.MATH].enum, ['#75cbe8', '#c9c9c9', '#f3f3f3']));
            dataArray.push(new GaugeConfig(enumArrayMap[SubjectEnumConst.VERBAL].val, enumArrayMap[SubjectEnumConst.VERBAL].enum, ['#f9d628', '#c9c9c9', '#f3f3f3']));

            this.doughnutArray = dataArray;
    });
})(angular);
