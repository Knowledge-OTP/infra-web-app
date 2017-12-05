(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config(
        function (SvgIconSrvProvider) {
            'ngInject';
            var svgMap = {
                'faq-circle-arrow-icon': 'components/faq/svg/circle-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });

})(angular);
