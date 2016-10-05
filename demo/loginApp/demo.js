angular.module('demo', ['znk.infra-web-app.loginApp', 'demoEnv'])
    .config(function ($translateProvider, $locationProvider,ENV) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');
        ENV.promoCodeEndPoint = "/promoCode/";
    })
    .run(function ($rootScope, $translate) {

        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    });
