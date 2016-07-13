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
.controller('Main', function () {

});
