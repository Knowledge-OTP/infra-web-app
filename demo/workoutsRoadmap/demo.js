angular.module('demo', [
        'znk.infra-web-app.workoutsRoadmap',
        'pascalprecht.translate'])
    .config(function ($translateProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en');
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    });
