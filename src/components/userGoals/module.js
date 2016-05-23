(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'ngMaterial',
        'ngTagsInput'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'plus-icon': 'components/userGoals/svg/plus-icon.svg',
                'dropdown-arrow-icon': 'components/userGoals/svg/dropdown-arrow.svg',
                'info-icon': 'components/userGoals/svg/info-icon.svg',
                'v-icon': 'components/userGoals/svg/v-icon.svg',
                'math-section-icon': 'components/userGoals/svg/math-section-icon.svg',
                'verbal-icon': 'components/userGoals/svg/verbal-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

