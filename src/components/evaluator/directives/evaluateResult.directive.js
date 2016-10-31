/**
 * evaluateResult
 *   pointsGetter - get user current points
 *   typeGetter - can be a subjectId or other type of id
 */
(function (angular) {
    'use strict';

        angular.module('znk.infra-web-app.evaluator').component('evaluateResult', {
            bindings: {
                pointsGetter: '&points',
                typeGetter: '&type' // can be a subjectId or other type of id
            },
            templateUrl: 'components/evaluator/templates/evaluateResult.template.html',
            controllerAs: 'vm',
            controller: function (ZnkEvaluateResultSrv) {
                'ngInject';

                var vm = this;

                var starStatusMap = {
                    empty: 1,
                    half: 2,
                    full: 3
                };

                var points = vm.points = vm.pointsGetter();

                var type =  vm.typeGetter();

                vm.starStatusMap = starStatusMap;

                vm.stars = [];

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
                        vm.stars.push(starStatus);
                    }
                }

                function addEvaluateText(evaluateResultByType) {
                    var evaluatePointsArr = evaluateResultByType.evaluatePointsArr;
                    var curEvaluatePoint;
                    for (var i = 0, ii = evaluatePointsArr.length; i < ii; i++) {
                        curEvaluatePoint = evaluatePointsArr[i];
                        if (curEvaluatePoint.maxPoints >= points) {
                            vm.evaluateText = curEvaluatePoint.evaluateText;
                            break;
                        }
                    }
                }

                function addStarsAndText(evaluateResultType) {
                    var evaluateResultByType = evaluateResultType[type];
                    addStars(evaluateResultByType);
                    addEvaluateText(evaluateResultByType);
                }

                ZnkEvaluateResultSrv.getEvaluateResultByType().then(function(evaluateResultType) {
                    addStarsAndText(evaluateResultType);
                });
            }
        }
    );
})(angular);
