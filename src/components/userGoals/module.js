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
                'user-goals-plus-icon': 'components/userGoals/svg/plus-icon.svg',
                'user-goals-dropdown-arrow-icon': 'components/userGoals/svg/dropdown-arrow.svg',
                'user-goals-arrow-icon': 'components/userGoals/svg/arrow-icon.svg',
                'user-goals-info-icon': 'components/userGoals/svg/info-icon.svg',
                'user-goals-v-icon': 'components/userGoals/svg/v-icon.svg',
                'user-goals-search-icon': 'components/userGoals/svg/search-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

