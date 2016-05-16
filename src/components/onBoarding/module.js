(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'ui.router'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'plus-icon': 'components/onBoarding/svg/plus-icon.svg',
                'on-boarding-heart': 'components/onBoarding/svg/on-boarding-heart.svg',
                'on-boarding-target': 'components/onBoarding/svg/on-boarding-target.svg',
                'on-boarding-hat': 'components/onBoarding/svg/on-boarding-hat.svg',
                'dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg',
                'search-icon': 'components/onBoarding/svg/search-icon.svg',
                'arrow-icon': 'components/onBoarding/svg/arrow-icon.svg',
                'info-icon': 'components/onBoarding/svg/info-icon.svg',
                'v-icon': 'components/onBoarding/svg/v-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);

            $stateProvider
                .state('onBoarding', {
                    url: '/onBoarding',
                    templateUrl: 'components/onBoarding/templates/onBoarding.template.html',
                    controller: 'OnBoardingController',
                    controllerAs: 'vm',
                    resolve: {
                        onBoardingStep: ['OnBoardingService', function (OnBoardingService) {
                           return OnBoardingService.getOnBoardingStep();
                        }]
                    }
                })
                .state('onBoarding.welcome', {
                    url: '/welcome',
                    templateUrl: 'components/onBoarding/templates/onBoardingWelcome.template.html',
                    controller: 'OnBoardingWelcomesController',
                    controllerAs: 'vm',
                    resolve: {
                        userProfile: function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }
                    }
                })
                .state('onBoarding.schools', {
                    url: '/schools',
                    templateUrl: 'components/onBoarding/templates/onBoardingSchools.template.html',
                    controller: 'OnBoardingSchoolsController',
                    controllerAs: 'vm'
                })
                .state('onBoarding.goals', {
                    url: '/goals',
                    templateUrl: 'components/onBoarding/templates/onBoardingGoals.template.html',
                    controller: 'OnBoardingGoalsController',
                    controllerAs: 'vm'
                })
                .state('onBoarding.diagnostic', {
                    url: '/diagnostic',
                    templateUrl: 'components/onBoarding/templates/onBoardingDiagnostic.template.html',
                    controller: 'OnBoardingDiagnosticController',
                    controllerAs: 'vm'
                });
        }
    ]).run(['$translatePartialLoader', function ($translatePartialLoader) {
        $translatePartialLoader.addPart('onBoarding');
    }]);

})(angular);

