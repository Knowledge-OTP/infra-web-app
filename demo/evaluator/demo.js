angular.module('demo', ['znk.infra-web-app.evaluator']).config(function($translateProvider, EvaluateSrvProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en');

        EvaluateSrvProvider.setEvaluateResultByType(function (SubjectEnum) {
            'ngInject';

            var evaluateResult = {};

            evaluateResult[SubjectEnum.SPEAKING.enum] = {
                starsNum: 4,
                pointsPerStar: 1,
                evaluatePointsArr: [
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
            };

            evaluateResult[SubjectEnum.WRITING.enum] = {
                starsNum: 5,
                pointsPerStar: 1,
                evaluatePointsArr: [
                    {
                        evaluateText: "LIMITED",
                        maxPoints: 2
                    },
                    {
                        evaluateText: "FAIR",
                        maxPoints: 3.5
                    },
                    {
                        evaluateText: "GOOD",
                        maxPoints: 5
                    }
                ]
            };

            return evaluateResult;
        });

})
.run(function ($rootScope, $translate) {
    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        $translate.refresh();
    });
})
.controller('Main', function ($scope, EvaluatorStatesEnum) {

    var evaluated = {
        activeState: EvaluatorStatesEnum.EVALUATED.enum,
        points: 2.5,
        type: 2
    };

    $scope.stateData = evaluated;

    $scope.changeToPending = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.PENDING.enum
        };
    };

    $scope.changeToNotPurchase = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.NOT_PURCHASE.enum
        };
    };

    $scope.changeToEvaluated = function() {
        $scope.stateData = evaluated;
    };

});
