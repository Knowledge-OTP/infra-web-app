angular.module('demo', ['znk.infra-web-app.evaluator']).config(function($translateProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en');
})
.run(function ($rootScope, $translate) {
    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        $translate.refresh();
    });
})
.controller('Main', function () {

});
