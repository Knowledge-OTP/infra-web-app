(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        ['ngAnimate',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'check-mark': 'components/purchase/svg/check-mark-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);
