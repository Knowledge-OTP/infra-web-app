angular.module('demo', [
    'znk.infra-web-app.tests'
])
    .config(function ($translateProvider, SvgIconSrvProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');

        var svgMap = {
            
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    })



.config(function (ScoringServiceProvider) {
    ScoringServiceProvider.setScoringLimits({
        exam: {
            min: 400,
            max: 1600
        },
        subjects: {
            min: 200,
            max: 800
        }
    });

    ScoringServiceProvider.setExamScoreFnGetter(function () {
        return function (scoresArr) {
            var totalScores = 0;
            angular.forEach(scoresArr, function (score) {
                totalScores += score;
            });
            return totalScores;
        }
    });
})
    
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
        // $translatePartialLoader.addPart('demo');
    });
