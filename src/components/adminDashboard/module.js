(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.general',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'znk.infra-web-app.znkToast',
        'znk.infra-web-app.elasticSearch',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.autoResize'
    ])
        .config([
            '$stateProvider',
            'SvgIconSrvProvider',
            function ($stateProvider, SvgIconSrvProvider) {
                $stateProvider
                    .state('app.admin', {
                        url: '/admin',
                        templateUrl: 'app/admin/templates/admin.template.html',
                        controller: 'AdminDashboardController',
                        controllerAs: 'vm'
                    })
                    .state('app.admin.eslink', {
                        url: '/eslink',
                        templateUrl: 'app/admin/esLink/templates/esLink.template.html',
                        controller: 'ESLinkController',
                        controllerAs: 'vm'
                    })
                    .state('app.admin.emetadata', {
                        url: '/emetadata',
                        templateUrl: 'app/admin/eMetadata/templates/eMetadata.template.html',
                        controller: 'EMetadataController',
                        controllerAs: 'vm'
                    });
                var svgMap = {
                    'myProfile-icon': 'components/adminDashboard/components/eMetadata/svg/myProfile-profile-icon.svg',
                    'myProfile-close-popup': 'components/adminDashboard/components/eMetadata/svg/myProfile-close-popup.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
