(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').directive('evaluateResult',
        function($translatePartialLoader){
        'ngInject';
        return {
            scope: {
                pointsGetter: '&points'
            },
            restrict: 'E',
            templateUrl: 'components/evaluator/templates/evaluateResult.template.html',
            link: function (scope) {

                $translatePartialLoader.addPart('evaluator');

                var evaluatePointsArr = [
                    {
                        evaluateText: "WEAK",
                        maxPoints: 1
                    },
                    {
                        evaluateText: "LIMITED",
                        maxPoints: 2
                    },
                    {
                        evaluateText: "FAIR",
                        maxPoints: 3
                    },
                    {
                        evaluateText: "GOOD",
                        maxPoints: 4
                    }
                ];

                var starStatusMap = {
                    empty: 1,
                    half: 2,
                    full: 3
                };

                var points = scope.points = scope.pointsGetter();

                function _getStarStatus(curMaxPoints, prevMaxPoints) {
                    var starStatus = starStatusMap.empty;
                    if (points >= curMaxPoints) {
                        starStatus = starStatusMap.full;
                    } else if(
                        points > prevMaxPoints &&
                        curMaxPoints > points) {
                        starStatus = starStatusMap.half;
                    }
                    return starStatus;
                }

                scope.starStatusMap = starStatusMap;
                scope.stars = [];

                var isAllReadySetText = false;

                for (var i = 0, ii = evaluatePointsArr.length; i < ii; i++) {
                    var curEvaluatePoint = evaluatePointsArr[i];
                    var prevEvaluatePoint = evaluatePointsArr[i - 1];
                    var prevMaxPoints = prevEvaluatePoint ? prevEvaluatePoint.maxPoints : 0;
                    var starStatus = {
                       status: _getStarStatus(curEvaluatePoint.maxPoints, prevMaxPoints)
                    };

                    scope.stars.push(starStatus);

                    if (isAllReadySetText) {
                      continue;
                    }

                    if (curEvaluatePoint.maxPoints >= points) {
                        scope.evaluateText = curEvaluatePoint.evaluateText;
                        isAllReadySetText = true;
                    }
                }

            }
        };
    });
})(angular);
