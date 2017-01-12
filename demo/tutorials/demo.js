'use strict';
angular.module('demo', [
    'znk.infra-web-app.tutorials',
    'demoEnv'
])

    .config(function ($translateProvider, SvgIconSrvProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');

        var svgMap = {
            'math-icon': 'svg/math-icon.svg',
            'verbal-icon': 'svg/verbal-icon.svg',
            'essay-icon': 'svg/essay-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);

    })

    .config(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise('/tipsAndTricks');
    })

    .config(function ($stateProvider) {
        $stateProvider.state('app', {
            template: '<ui-view></ui-view>',
            abstract: true
        })
    })

    .run(function ($rootScope, $translate, $translatePartialLoader, $state) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
        // $translatePartialLoader.addPart('demo');

        // $rootScope.openTutorials = function () {
        //     $state.go('app.tutorials');
        // }
    });
