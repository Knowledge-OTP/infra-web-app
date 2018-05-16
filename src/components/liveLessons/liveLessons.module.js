(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.user',
        'znk.infra.mailSender',
        'znk.infra.storage',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'close-popup': 'components/liveLessons/svg/close-popup.svg',
                'reschedule-icon': 'components/liveLessons/svg/reschedule-icon.svg',
                'calendar-icon': 'components/liveLessons/svg/calendar-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(window, angular);
