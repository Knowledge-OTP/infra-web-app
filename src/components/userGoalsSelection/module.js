(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.general',
        'ngMaterial',
        'ngTagsInput',
        'znk.infra-web-app.userGoals'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'user-goals-plus-icon': 'components/userGoalsSelection/svg/plus-icon.svg',
                'user-goals-dropdown-arrow-icon': 'components/userGoalsSelection/svg/dropdown-arrow.svg',
                'user-goals-arrow-icon': 'components/userGoalsSelection/svg/arrow-icon.svg',
                'user-goals-info-icon': 'components/userGoalsSelection/svg/info-icon.svg',
                'user-goals-v-icon': 'components/userGoalsSelection/svg/v-icon.svg',
                'user-goals-search-icon': 'components/userGoalsSelection/svg/search-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

