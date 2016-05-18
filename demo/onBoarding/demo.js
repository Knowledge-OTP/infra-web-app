angular.module('demo', ['znk.infra-web-app.onBoarding', 'ngSanitize'])
    .config(function ($translateProvider, znkAnalyticsSrvProvider, $urlRouterProvider, InfraConfigSrvProvider) {

        $urlRouterProvider.otherwise('/onBoarding');

        $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
            .preferredLanguage('en')
            .useSanitizeValueStrategy('sanitize');

        znkAnalyticsSrvProvider.setEventsHandler(function () {
            return {
                eventTrack: angular.noop,
                timeTrack: angular.noop,
                pageTrack: angular.noop,
                setUsername: angular.noop,
                setUserProperties: angular.noop
            };
        });

        var storageFake = ['$q', function($q) {
            return {
                get: function() {
                    return $q.when({});
                },
                set: function(path, data) {
                    return $q.when(data);
                },
                variables: {
                    appUserSpacePath: ''
                }
            }
        }];

        InfraConfigSrvProvider.setStorages(storageFake, storageFake);

        InfraConfigSrvProvider.setUserDataFn(['AuthService', function (AuthService) {
            return AuthService.getAuth();
        }]);
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });

    }) // mock AuthService
    .factory('AuthService', function() {
        return {
            getAuth: function() {
                return {
                    uid: '666',
                    auth: {
                        name: 'oded'
                    },
                    password: {
                        email: 'oded@zinkerz.com'
                    }
                }
            }
        }
    })// mock ENV
    .service('ENV', function () {
        this.dreamSchoolJsonUrl = "URL://";
        this.promiseTimeOut = 5000;
    });
