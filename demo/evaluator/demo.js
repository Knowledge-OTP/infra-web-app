angular.module('demo', ['znk.infra-web-app.evaluator']).config(function($translateProvider, ZnkEvaluateResultSrvProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en');

        ZnkEvaluateResultSrvProvider.setEvaluateResultByType(function (SubjectEnum) {
            'ngInject';

            var evaluateResultTypes = {};

            evaluateResultTypes[SubjectEnum.SPEAKING.enum] = {
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

            evaluateResultTypes[SubjectEnum.WRITING.enum] = {
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

            return evaluateResultTypes;
        });

        ZnkEvaluateResultSrvProvider.setEvaluateTypes(function(SubjectEnum) {
            'ngInject';

            var evaluateTypes = {};

            evaluateTypes[SubjectEnum.SPEAKING.enum] = {
                aliasName: 'speaking'
            };
            evaluateTypes[SubjectEnum.WRITING.enum] = {
                aliasName: 'writing'
            };

            return evaluateTypes;
        });

})
.run(function ($rootScope, $translate) {
    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        $translate.refresh();
    });
})
.controller('Main', function ($scope, EvaluatorStatesEnum, $translatePartialLoader) {

    $translatePartialLoader.addPart('demo');

    function getRandom() {
       return Math.floor(Math.random()*(2-1+1)+1);
    }

    $scope.changeToPending = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.PENDING.enum,
            type: getRandom() === 1 ? 2 : 4
        };
    };

    $scope.changeToNotPurchase = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.NOT_PURCHASE.enum,
            type: getRandom() === 1 ? 2 : 4
        };
    };

    $scope.changeToEvaluated = function() {
        $scope.stateData = {
            activeState: EvaluatorStatesEnum.EVALUATED.enum,
            points: 2.5,
            type: getRandom() === 1 ? 2 : 4
        };
    };

    $scope.changeToEvaluated();

});
