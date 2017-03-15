(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticSummaryController',
        function (diagnosticSummaryData, SubjectEnum, SubjectEnumConst, WorkoutsDiagnosticFlow, purchaseService, $log) {
            'ngInject';

            var self = this;

            var diagnosticScoresObj = diagnosticSummaryData.userStats;
            var goalScoreObj = diagnosticSummaryData.userGoals;
            var diagnosticResultObj = diagnosticSummaryData.diagnosticResult;
            var diagnosticCompositeScore = diagnosticSummaryData.compositeScore;
            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
            var scoringLimits = diagnosticSummaryData.scoringLimits;
            var enumArrayMap = {};
            angular.forEach(SubjectEnum, function (enumObj) {
                enumArrayMap[enumObj.enum] = enumObj;
            });

            function getMaxScore(subjectId) {
                if (scoringLimits.subjects && scoringLimits.subjects.max) {
                    return scoringLimits.subjects.max;
                }
                else if (scoringLimits.subjects[subjectId] && scoringLimits.subjects[subjectId].max) {
                    return scoringLimits.subjects[subjectId].max;
                } else {
                    $log.debug('WorkoutsDiagnosticSummaryController: getMaxScore error');
                }
            }

            var GOAL = 'Goal';
            var MAX = 'Max';

            if (!diagnosticResultObj.userStats) {
                diagnosticResultObj.userStats = diagnosticScoresObj;
                diagnosticResultObj.compositeScore = diagnosticCompositeScore;
                diagnosticResultObj.$save();
            }

            self.isSubjectsWaitToBeEvaluated = false;

            for (var i in diagnosticScoresObj) {
                if (diagnosticScoresObj.hasOwnProperty(i)) {
                    if (diagnosticScoresObj[i] === null) {
                        self.isSubjectsWaitToBeEvaluated = true;
                        break;
                    }
                }
            }

            if (self.isSubjectsWaitToBeEvaluated) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.EVALUATE_START';
            } else if (diagnosticResultObj.compositeScore > diagnosticSettings.summary.greatStart) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GREAT_START';
            } else if (diagnosticResultObj.compositeScore > diagnosticSettings.summary.goodStart) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GOOD_START';
            } else {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.BAD_START';
            }

            this.compositeScore = diagnosticResultObj.compositeScore;
            this.hideCompositeScore = diagnosticSettings.summary.hideCompositeScore;

            var doughnutValues = {};
            for (var subjectId in diagnosticResultObj.userStats) {
                if (diagnosticResultObj.userStats.hasOwnProperty(subjectId)) {
                    var subjectName = enumArrayMap[subjectId].val;
                    doughnutValues[subjectName] = diagnosticResultObj.userStats[subjectId];
                    doughnutValues[subjectName + GOAL] = goalScoreObj[subjectName] > diagnosticResultObj.userStats[subjectId] ? (goalScoreObj[subjectName] - diagnosticResultObj.userStats[subjectId]) : 0;
                    doughnutValues[subjectName + MAX] = getMaxScore(subjectId) - (doughnutValues[subjectName + GOAL] + diagnosticResultObj.userStats[subjectId]);
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
                this.goalPoint = getGoalPoint(goalScoreObj[_subjectName], _subjectId);
                this.data = [doughnutValues[_subjectName], doughnutValues[_subjectName + GOAL], doughnutValues[_subjectName + MAX]];
                this.colors = colorsArray;
                this.subjectName = 'WORKOUTS_DIAGNOSTIC_SUMMARY.' + angular.uppercase(_subjectName);
                this.score = diagnosticResultObj.userStats[_subjectId];
                this.scoreGoal = goalScoreObj[_subjectName];
            }

            function getGoalPoint(scoreGoal, subjectId) {
                var degree = (scoreGoal / getMaxScore(subjectId)) * 360 - 90;    // 90 - degree offset
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
            angular.forEach(diagnosticSettings.summary.subjects, function (subject) {
                dataArray.push(new GaugeConfig(subject.name, subject.id, subject.colors));
            });

            this.doughnutArray = dataArray;

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            purchaseService.hasProVersion().then(function (isPro) {
                self.showUpgradeBtn = !isPro && diagnosticSettings.summary && diagnosticSettings.summary.showUpgradeBtn;
            });
        });
})(angular);
