/**
 * evaluateResult
 *   pointsGetter - get user current points
 *   typeGetter - can be a subjectId or other type of id
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').directive('evaluateResult',
        function($translatePartialLoader, EvaluateSrv) {
        'ngInject';
        return {
            scope: {
                pointsGetter: '&points',
                typeGetter: '&type' // can be a subjectId or other type of id
            },
            restrict: 'E',
            templateUrl: 'components/evaluator/templates/evaluateResult.template.html',
            link: function (scope) {

                $translatePartialLoader.addPart('evaluator');

                var starStatusMap = {
                    empty: 1,
                    half: 2,
                    full: 3
                };

                var points = scope.points = scope.pointsGetter();

                var type =  scope.typeGetter();

                scope.starStatusMap = starStatusMap;

                scope.stars = [];

                function _getStarStatus(curPoints, prevPoints) {
                    var starStatus = starStatusMap.empty;
                    if (points >= curPoints) {
                        starStatus = starStatusMap.full;
                    } else if(
                        curPoints > points &&
                        points > prevPoints) {
                        starStatus = starStatusMap.half;
                    }
                    return starStatus;
                }

                function addStars(evaluateResultByType) {
                    var starsNum = evaluateResultByType.starsNum;
                    var pointsPerStar = evaluateResultByType.pointsPerStar;
                    var curPoints = 0;
                    for (var i = 0, ii = starsNum; i < ii; i++) {
                        curPoints += pointsPerStar;
                        var starStatus = {
                            status: _getStarStatus(curPoints, curPoints - pointsPerStar)
                        };
                        scope.stars.push(starStatus);
                    }
                }

                function addEvaluateText(evaluateResultByType) {
                    var evaluatePointsArr = evaluateResultByType.evaluatePointsArr;
                    var curEvaluatePoint;
                    for (var i = 0, ii = evaluatePointsArr.length; i < ii; i++) {
                        curEvaluatePoint = evaluatePointsArr[i];
                        if (curEvaluatePoint.maxPoints >= points) {
                            scope.evaluateText = curEvaluatePoint.evaluateText;
                            break;
                        }
                    }
                }

                function addStarsAndText(evaluateResultType) {
                    var evaluateResultByType = evaluateResultType[type];
                    addStars(evaluateResultByType);
                    addEvaluateText(evaluateResultByType);
                }

                EvaluateSrv.getEvaluateResultByType().then(function(evaluateResultType) {
                    addStarsAndText(evaluateResultType);
                });
            }
        };
    });
})(angular);
