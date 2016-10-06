angular.module('demo', ['znk.infra-web-app.loginApp', 'demoEnv', 'znk.infra-web-app.promoCode'])
    .config(function ($translateProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');
    })
    .run(function ($rootScope, $translate) {

        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
    });
