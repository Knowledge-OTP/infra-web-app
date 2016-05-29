(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.svgIcon',
        'znk.infra.popUp',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'invitation-teacher-icon': 'components/invitation/svg/teacher-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);
