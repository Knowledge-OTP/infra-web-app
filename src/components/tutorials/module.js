(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.tutorials', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.config',
        'znk.infra.general',
        'znk.infra.svgIcon',
        'ui.router',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.completeExercise',
        'znk.infra.scoring',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.loadingAnimation',
        'znk.infra.exerciseResult',
        'znk.infra.contentAvail',
        'znk.infra.contentGetters',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.purchase'

    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
        var svgMap = {
            'locked-icon': 'components/tutorials/svg/subject-locked-icon.svg',
            'tutorials-check-mark-icon': 'components/tutorials/svg/tutorials-check-mark-icon.svg'
        };
            SvgIconSrvProvider.registerSvgSources(svgMap);

        }
    ]);
})(angular);
