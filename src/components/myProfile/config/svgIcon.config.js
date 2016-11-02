(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .config(function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'myProfile-icon': 'components/myProfile/svg/myProfile-profile-icon.svg',
                'myProfile-close-popup': 'components/myProfile/svg/myProfile-close-popup.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });
})(angular);
