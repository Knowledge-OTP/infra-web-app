(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.imageZoomer', [
        'znk.infra.svgIcon',
        'ngMaterial'
    ]).config(function(SvgIconSrvProvider){
        'ngInject';
        var svgMap = {
            'image-zoomer-full-screen-icon': 'components/imageZoomer/svg/full-screen-icon.svg',
            'image-zoomer-close-popup': 'components/imageZoomer/svg/close-popup.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    });
})(angular);
