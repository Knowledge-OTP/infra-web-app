(function (angular) {
    'use strict';

    angular.module('demo',
        ['znk.infra-web-app.znkHeader',
            'demoEnv',
            'znk.infra-web-app.invitation',
            'znk.infra.activePanel'])
    .config(function (znkHeaderSrvProvider, $stateProvider, PresenceServiceProvider) {
        'ngInject';
        PresenceServiceProvider.setAuthServiceName('AuthService');

        $stateProvider
            .state('item1', {
                url: '/item1',
                template: '<div>item1</div>'
            })
            .state('item2', {
                url: '/item2',
                template: '<div>item2</div>'
            });

        var demoItem1 = {
            text: 'item 1',
            goToState: 'item1',
            stateOpt: { reload: true }
        };

        var demoItem2 = {
            text: 'item 2',
            goToState: 'item2'
        };
        var additionalItems = [demoItem1, demoItem2];

        znkHeaderSrvProvider.addAdditionalNavMenuItems(additionalItems);
    });

})(angular);
