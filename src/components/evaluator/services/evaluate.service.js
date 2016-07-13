/**
 * EvaluateSrv
 *
 *  setEvaluateResultByType: get an fn function that returns object
 *  like:  {
                starsNum: 4, // number of stars to display
                pointsPerStar: 1, // points that should calc per star
                evaluatePointsArr: [ // array of evaluate statuses and each max points
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
                ]
            }
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').provider('EvaluateSrv',
        function() {

        var _evaluateResultByType;

        this.setEvaluateResultByType = function(evaluateResultByType) {
            _evaluateResultByType = evaluateResultByType;
        };

        this.$get = function($q, $injector, $log) {
            'ngInject';

            var evaluateSrvApi = {};

            evaluateSrvApi.getEvaluateResultByType = function() {

                if(!_evaluateResultByType) {
                    var errMsg = 'EvaluateSrv: evaluateResultByType was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return $q.when($injector.invoke(_evaluateResultByType));
            };

            return evaluateSrvApi;

        };
    });
})(angular);
