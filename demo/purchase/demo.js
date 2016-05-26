angular.module('demo', ['znk.infra-web-app.purchase', 'znk.infra-web-app.znkAnalytics'])
    .config(function ($translateProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en')
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    });

