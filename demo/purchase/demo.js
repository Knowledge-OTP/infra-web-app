angular.module('demo', ['znk.infra-web-app.purchase', 'ngSanitize'])
    .config(function ($translateProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en')
            .useSanitizeValueStrategy('sanitize');
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    });

