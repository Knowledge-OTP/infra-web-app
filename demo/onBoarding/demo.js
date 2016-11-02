angular.module('demo', ['znk.infra-web-app.onBoarding'])
    .config(function ($stateProvider,$urlRouterProvider, InfraConfigSrvProvider,
                      OnBoardingServiceProvider, DiagnosticIntroSrvProvider, UserGoalsServiceProvider,
                      SvgIconSrvProvider, ScoringServiceProvider) {
        'ngInject';

        var svgMap = {
            'math-section-icon': 'svg/math-section-icon.svg',
            'verbal-icon': 'svg/verbal-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);

        $stateProvider.state('app', {
            abstract: true,
            template: '<ui-view></ui-view>'
        });

        $urlRouterProvider.otherwise('/onBoarding');

        var storageFake = ['$q', function($q) {
            return {
                get: function(path, data) {
                    return $q.when(data || {});
                },
                set: function(path, data) {
                    return $q.when(data || {});
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

        OnBoardingServiceProvider.settings = {
           showSchoolStep: true
        };

        DiagnosticIntroSrvProvider.setConfigGetter(['ENV', function(ENV) {
            return {
                subjects: [
                    {
                        id: ENV.MATH,
                        subjectNameAlias: 'math',
                        subjectIconName: 'math-section-icon'
                    },
                    {
                        id: ENV.ENGLISH,
                        subjectNameAlias: 'english',
                        subjectIconName: 'math-section-icon'
                    },               {
                        id: ENV.READING,
                        subjectNameAlias: 'reading',
                        subjectIconName: 'math-section-icon'
                    },
                    {
                        id: ENV.SCIENCE,
                        subjectNameAlias: 'science',
                        subjectIconName: 'math-section-icon'
                    }
                ],
                all: {
                    subjectNameAlias: 'all',
                    hideSectionQuestion: true
                },
                none: {
                    subjectNameAlias: 'none',
                    hideSectionQuestion: true
                }
            };
        }]);

        DiagnosticIntroSrvProvider.setActiveSubjectGetter(['ENV', function(ENV) {
            return ENV.ENGLISH;
        }]);

        ScoringServiceProvider.setScoringLimits({
            exam: {
                min: 400,
                max: 1600
            },
            subjects: {
                min: 200,
                max: 800
            }
        });

        ScoringServiceProvider.setExamScoreFnGetter(function () {
             return function(scoresArr) {
                 var totalScores = 0;
                 angular.forEach(scoresArr, function (score) {
                     totalScores += score;
                 });
                 return totalScores;
             }
        });

    })
    // mock AuthService
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
        this.dreamSchoolJsonUrl = "./dreamSchools.json";
        this.promiseTimeOut = 5000;
        this.MATH = 0; // mock subject id from enum
        this.ENGLISH = 7;
        this.READING = 10;
        this.SCIENCE = 2;
        this.ALL = 'all';
        this.NONE = 'none';
    });
