/**
 * EvaluateSrv
 *
 *  setEvaluateResultByType: get an fn function that returns object of types(like subjects) with configuration
 *  like:  {
 *           0: {
                starsNum: 4, // number of stars to display
                pointsPerStar: 1, // points that should calc per star,
                aliasName: 'speaking', for class name and etc
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
            1: {
               ...
            }
         }
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').provider('ZnkEvaluateResultSrv',
        function() {

        var _evaluateResultByType;
        var _evaluateTypes;

        this.setEvaluateResultByType = function(evaluateResultByType) {
            _evaluateResultByType = evaluateResultByType;
        };

        this.setEvaluateTypes = function(evaluateTypes) {
            _evaluateTypes = evaluateTypes;
        };

        this.$get = function($q, $injector, $log) {
            'ngInject';

            var evaluateSrvApi = {};

            function invokeEvaluateFn(evaluateFn, evaluateFnName) {
                if(!evaluateFn) {
                    var errMsg = 'ZnkEvaluateResultSrv: '+ evaluateFnName +' was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return $q.when($injector.invoke(evaluateFn));
            }

            evaluateSrvApi.getEvaluateResultByType = invokeEvaluateFn.bind(null, _evaluateResultByType, 'evaluateResultByType');

            evaluateSrvApi.getEvaluateTypes = invokeEvaluateFn.bind(null, _evaluateTypes, 'evaluateTypes');

            return evaluateSrvApi;

        };
    });
})(angular);
