angular.module('demo', [
    'znk.infra-web-app.performance'
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
    
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
    });
