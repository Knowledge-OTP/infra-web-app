angular.module('demo', [
        'znk.infra-web-app.diagnostic',
        'pascalprecht.translate'])
    .config(function ($translateProvider, StatsSrvProvider, $urlRouterProvider, InfraConfigSrvProvider, UserGoalsServiceProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en');

        var getCategoryFn = function (/*CategoryService*/) {
            return {

            };
        };

        StatsSrvProvider.setCategoryLookup(getCategoryFn);

        InfraConfigSrvProvider.setUserDataFn(['AuthService', function (AuthService) {
            return AuthService.getAuth();
        }]);

        UserGoalsServiceProvider.settings = {
            defaultSubjectScore: 600,
            minSchoolScore: 400,
            maxSchoolScore: 1600,
            minGoalsScore: 200,
            maxGoalsScore: 800,
            updateGoalNum: 10,
            subjects: [
                { name: 'math', svgIcon: 'math-section-icon' },
                { name: 'verbal', svgIcon: 'verbal-icon' }
            ]
        };

        $urlRouterProvider.otherwise('/diagnostic');
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    });
