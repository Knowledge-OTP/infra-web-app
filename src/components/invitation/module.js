(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.popUp',
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'invitation-teacher-icon': 'components/invitation/svg/teacher-icon.svg',
                    'invitation-close-popup': 'components/invitation/svg/invitation-close-popup.svg',
                    'invitation-teacher-active-icon': 'components/invitation/svg/invitation-teacher-active-icon.svg',
                    'tutors-list-edit-icon': 'components/invitation/svg/tutors-list-edit-icon.svg',
                    'received-invitations-icon': 'components/invitation/svg/received-invitations-icon.svg',
                    'invitation-v-icon': 'components/invitation/svg/invitation-v-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);
