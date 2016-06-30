(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg',[
        'ngSanitize',
        'znk.infra.svgIcon'
    ])
        .config(function(SvgIconSrvProvider){
            'ngInject';

            var svgMap = {
                'iap-msg-close-msg': 'components/iapMsg/svg/close-msg.svg',
                'iap-msg-hint-bubble': 'components/iapMsg/svg/hint-bubble.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });
})(angular);
