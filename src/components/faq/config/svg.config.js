(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'faq-circle-arrow-icon': 'components/svg/circle-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);
