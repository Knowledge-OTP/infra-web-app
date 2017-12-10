(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper', [
        'znk.infra.znkTimeline',
        'znk.infra.estimatedScore',
        'znk.infra-web-app.userGoals',
        'znk.infra.scoring'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper').component('znkTimelineWebWrapper', {
        templateUrl: 'components/znkTimelineWebWrapper/directives/znkTimelineWebWrapper.template.html',
        bindings: {
            activeExerciseId: '=?',
            currentSubjectId: '@subjectId',
            showInduction: '<?',
            showTooltips: '<?',
            results: '<?'
        },
        controllerAs: 'vm',
        controller: ["EstimatedScoreSrv", "UserGoalsService", "ScoringService", "SubjectEnum", "$q", "$attrs", "$element", "ExerciseTypeEnum", function (EstimatedScoreSrv, UserGoalsService, ScoringService, SubjectEnum, $q, $attrs, $element, ExerciseTypeEnum) {
            'ngInject';

            var vm = this;
            var estimatedScoresDataProm = EstimatedScoreSrv.getEstimatedScores();
            var getGoalsProm = UserGoalsService.getGoals();
            var inProgressProm = false;
            var subjectEnumToValMap = SubjectEnum.getEnumMap();
            var scoringLimits = ScoringService.getScoringLimits();
            var subjects = scoringLimits.subjects;
            var maxScore = (subjects && angular.isNumber(subjects.max)) ? subjects.max : (subjects[vm.currentSubjectId] && angular.isNumber(subjects[vm.currentSubjectId].max)) ? subjects[vm.currentSubjectId].max : 0;
            var minScore = (subjects && angular.isNumber(subjects.min)) ? subjects.min : (subjects[vm.currentSubjectId] && angular.isNumber(subjects[vm.currentSubjectId].min)) ? subjects[vm.currentSubjectId].min : 0;
            var currentSubjectId;

            // options
            var optionsPerDevice = {
                width: 685,
                height: 150,
                distance: 90,
                upOrDown: 100,
                yUp: 40,
                yDown: 60,
                xLeft: 20,
                xRight: 20
            };

            var subjectIdToIndexMap = {};
            subjectIdToIndexMap[ExerciseTypeEnum.TUTORIAL.enum] = 'tutorial';
            subjectIdToIndexMap[ExerciseTypeEnum.PRACTICE.enum] = 'practice';
            subjectIdToIndexMap[ExerciseTypeEnum.GAME.enum] = 'game';
            subjectIdToIndexMap[ExerciseTypeEnum.SECTION.enum] = 'section';
            subjectIdToIndexMap[ExerciseTypeEnum.DRILL.enum] = 'drill';
            subjectIdToIndexMap.diagnostic = 'diagnostic';


            vm.options = {
                colorId: vm.currentSubjectId,
                isMobile: false,
                width: optionsPerDevice.width,
                height: optionsPerDevice.height,
                isSummery: (vm.activeExerciseId) ? vm.activeExerciseId : false,
                type: 'multi',
                isMax: true,
                max: maxScore,
                min: minScore,
                subPoint: 35,
                distance: optionsPerDevice.distance,
                lineWidth: 2,
                numbers: {
                    font: '200 12px Lato',
                    fillStyle: '#4a4a4a'
                },
                onFinish: function (obj) {
                    var summeryScore = obj.data.summeryScore;
                    var scoreData;

                    if (summeryScore) {
                        scoreData = _getSummaryData(summeryScore);
                    } else {
                        scoreData = _getRegularData(obj.data.lastLine);
                    }

                    vm.timelineMinMaxStyle = {'top': scoreData.y + 'px', 'left': scoreData.x + 'px'};

                    _getPromsOrValue().then(function (results) {
                        var userGoals = results[1];
                        var points = userGoals[subjectEnumToValMap[currentSubjectId]] - scoreData.score;
                        vm.goalPerSubject = scoreData.score;
                        vm.points = (points > 0) ? points : false;
                    });

                    if (scoreData.score && scoreData.prevScore) {
                        if (scoreData.score > scoreData.prevScore) {
                            vm.timelineLinePlus = '+' + (scoreData.score - scoreData.prevScore);
                            vm.isRed = false;
                        } else if (scoreData.score < scoreData.prevScore) {
                            vm.timelineLinePlus = '-' + (scoreData.prevScore - scoreData.score);
                            vm.isRed = true;
                        }
                    }

                    _scrolling();

                    vm.toolTipArr = obj.data.lastLine.slice(1);
                }
            };

            function _getSummaryData(summeryScore) {
                var x = summeryScore.lineTo.x - optionsPerDevice.xLeft;
                var y = summeryScore.lineTo.y + optionsPerDevice.yDown;
                var angleDeg;
                if (summeryScore.next) {
                    angleDeg = Math.atan2(summeryScore.lineTo.y - summeryScore.next.y, summeryScore.lineTo.x - summeryScore.next.x) * 180 / Math.PI;
                }

                if (angleDeg && angleDeg < -optionsPerDevice.upOrDown && summeryScore.lineTo.y < optionsPerDevice.upOrDown) {
                    x -= 30;
                }

                return {
                    x: x,
                    y: y,
                    score: summeryScore.score,
                    prevScore: summeryScore.prev.score
                };
            }

            function _getRegularData(lastLineObj) {
                var lastLine = lastLineObj[lastLineObj.length - 1];
                var beforeLast = lastLineObj[lastLineObj.length - 2];
                var x = lastLine.lineTo.x - optionsPerDevice.xLeft;
                var y = (lastLine.lineTo.y < optionsPerDevice.upOrDown) ? lastLine.lineTo.y + optionsPerDevice.yDown : lastLine.lineTo.y - optionsPerDevice.yUp;
                var angleDeg = Math.atan2(lastLine.lineTo.y - beforeLast.lineTo.y, lastLine.lineTo.x - beforeLast.lineTo.x) * 180 / Math.PI;

                if (angleDeg < -40 || angleDeg > 40) {
                    x += 20;
                }

                return {
                    x: x,
                    y: y,
                    score: lastLine.score,
                    prevScore: beforeLast.score
                };
            }


            function _scrolling() {
                var domElement = $element.children()[0];
                if (domElement.scrollWidth > domElement.clientWidth) {
                    domElement.scrollLeft += domElement.scrollWidth - domElement.clientWidth;
                }
            }

            function _getPromsOrValue() {
                if (!inProgressProm) {
                    inProgressProm = $q.all([estimatedScoresDataProm, getGoalsProm]);
                }
                return (angular.isFunction(inProgressProm)) ? inProgressProm : $q.when(inProgressProm);
            }

            function _extendData(dataPerSubject) {
                if (!vm.showTooltips) {
                    return addIconKey(dataPerSubject);
                }

                var newDataArr = [];
                var exerciseResults;
                angular.forEach(dataPerSubject, function (value, index) {
                    // add icon key
                    var type = subjectIdToIndexMap[value.exerciseType];
                    if (index === 0 && type === 'section') {
                        type = 'diagnostic';
                    }
                    value.iconKey = type || false;
                    // add workout name and title
                    if (vm.results && vm.results.exerciseResults) {
                        exerciseResults = vm.results.exerciseResults;
                        for (var i = 0, ii = exerciseResults.length; i < ii; i++) {
                            if (value.exerciseId === exerciseResults[i].exerciseId) {
                                value.workoutTitle = exerciseResults[i].exerciseName + ': ' + exerciseResults[i].exerciseDescription;
                                break;
                            }
                        }
                    }
                    newDataArr.push(value);
                });
                return newDataArr;
            }

            function addIconKey(dataPerSubject) {
                var newDataArr = [];
                angular.forEach(dataPerSubject, function (value, index) {
                    var type = subjectIdToIndexMap[value.exerciseType];
                    if (index === 0 && type === 'section') {
                        type = 'diagnostic';
                    }
                    value.iconKey = type || false;
                    newDataArr.push(value);
                });
                return newDataArr;
            }

            function _getRoundScore(estimatedScoresDatePerSubject) {
                if (!estimatedScoresDatePerSubject.length) {
                    return [];
                }
                return estimatedScoresDatePerSubject.map(function (scoreData) {
                    scoreData.score = Math.round(scoreData.score) || 0;
                    return scoreData;
                });
            }

            $attrs.$observe('subjectId', function (newVal, oldVal) {
                if (newVal === oldVal || newVal === '') {
                    return;
                }
                currentSubjectId = vm.currentSubjectId = newVal;
                _getPromsOrValue().then(function (results) {
                    inProgressProm = results;
                    var estimatedScoresData = results[0];
                    var estimatedScoresDatePerSubject = _getRoundScore(estimatedScoresData[currentSubjectId]);
                    vm.animation = true;
                    vm.timelineLinePlus = false;
                    vm.timeLineData = {
                        data: _extendData(estimatedScoresDatePerSubject),
                        id: currentSubjectId
                    };
                    vm.points = 0;
                });
            });
        }]
    });
})(angular);

angular.module('znk.infra-web-app.znkTimelineWebWrapper').run(['$templateCache', function ($templateCache) {
  $templateCache.put("components/znkTimelineWebWrapper/directives/znkTimelineWebWrapper.template.html",
    "<div class=\"znk-timeline-web-wrapper znk-scrollbar\" translate-namespace=\"TIMELINE_WEB_WRAPPER\">\n" +
    "    <div class=\"time-line-wrapper\">\n" +
    "        <div class=\"progress-val\"\n" +
    "             ng-style=\"vm.timelineMinMaxStyle\"\n" +
    "             ng-if=\"vm.timeLineData.data.length\">\n" +
    "            <div class=\"goal-wrapper\">{{vm.goalPerSubject}}\n" +
    "                <div class=\"timeline-plus\"\n" +
    "                     ng-if=\"vm.timelineLinePlus && vm.showInduction\"\n" +
    "                     ng-class=\"{ 'red-point': vm.isRed, 'green-point': !vm.isRed }\">\n" +
    "                    {{vm.timelineLinePlus}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"progress-title\"\n" +
    "                 ng-style=\"{ visibility: (vm.points) ? 'visiable' : 'hidden' }\"\n" +
    "                 translate=\".POINTS_LEFT\"\n" +
    "                 translate-values=\"{points: {{vm.points}} }\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"tool-tip-area\"\n" +
    "             ng-if=\"vm.showTooltips\"\n" +
    "             ng-repeat=\"tooltip in vm.toolTipArr track by $index\"\n" +
    "             ng-class=\"{'last-item':$last === true}\"\n" +
    "             ng-style=\"{'top': $last === true ? (tooltip.lineTo.y+50) +'px' : (tooltip.lineTo.y+60) +'px', 'left': $last === true ? (tooltip.lineTo.x - 11) +'px' : (tooltip.lineTo.x-1)+'px'}\">\n" +
    "            <md-tooltip md-direction=\"top\" class=\"tooltip-box md-whiteframe-2dp\">\n" +
    "                <div class=\"tooltip-content\">\n" +
    "                    <div class=\"exercise-date\">{{tooltip.time | date: 'MMM dd'}}</div>\n" +
    "                    <div class=\"exercise-title\">{{tooltip.workoutTitle}}</div>\n" +
    "                    <div class=\"score-title\" translate-values=\"{subjectName: vm.subjectEnumToValMap[vm.currentSubjectId]}\" translate=\".ESTIMATED_SUBJECT_SCORE\"></div>\n" +
    "                    <div class=\"exercise-score\">{{tooltip.score}}</div>\n" +
    "                </div>\n" +
    "            </md-tooltip>\n" +
    "        </div>\n" +
    "        <canvas znk-timeline\n" +
    "                timeline-data=\"vm.timeLineData\"\n" +
    "                timeline-settings=\"vm.options\">\n" +
    "        </canvas>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
