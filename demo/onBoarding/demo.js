angular.module('demo', ['znk.infra-web-app.onBoarding', 'ngSanitize'])
    .config(function ($translateProvider, znkAnalyticsSrvProvider, $urlRouterProvider, InfraConfigSrvProvider, OnBoardingServiceProvider, DiagnosticIntroSrvProvider, UserGoalsServiceProvider) {

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

        DiagnosticIntroSrvProvider.setConfigMapFn(['ENV', function(ENV) {
            return {
                subjects: [
                    {
                        id: ENV.MATH,
                        subjectIconName: 'math-section-icon',
                        raccoonClassName: 'diagnostic-raccoon-math',
                        iconCircleClassName: 'math-color',
                        colorClassName: 'math',
                        descriptionTranslate: '.DIAG_INTR_LETS_LEARN',
                        instructionsTranslate: '.INSTRUCTIONS_MATH_CALC',
                        subjectNameTranslate: '.MATH_CALC',
                        subjectTextTranslate: '.LETS_START_MATH_CALC'
                    },
                    {
                        id: ENV.ENGLISH,
                        subjectIconName: 'math-section-icon',
                        raccoonClassName: 'diagnostic-raccoon-english',
                        iconCircleClassName: 'english-color',
                        colorClassName: 'english',
                        descriptionText: '.DIAG_INTR_THIS_HALFWAY',
                        instructionsTranslate: '.INSTRUCTIONS_MATH_CALC',
                        subjectNameTranslate: '.MATH_CALC',
                        subjectTextTranslate: '.LETS_START_MATH_CALC'
                    },               {
                        id: ENV.READING,
                        subjectIconName: 'math-section-icon',
                        raccoonClassName: 'diagnostic-raccoon-reading',
                        iconCircleClassName: 'reading-color',
                        colorClassName: 'reading',
                        descriptionText: '.DIAG_INTR_THIS_ALMOST_THERE',
                        instructionsTranslate: '.INSTRUCTIONS_MATH_CALC',
                        subjectNameTranslate: '.MATH_CALC',
                        subjectTextTranslate: '.LETS_START_MATH_CALC'
                    },
                    {
                        id: ENV.SCIENCE,
                        subjectIconName: 'math-section-icon',
                        raccoonClassName: 'diagnostic-raccoon-science',
                        iconCircleClassName: 'science-color',
                        colorClassName: 'science',
                        descriptionText: '.DIAG_INTR_THIS_QUICK_TEST',
                        instructionsTranslate: '.INSTRUCTIONS_MATH_CALC',
                        subjectNameTranslate: '.MATH_CALC',
                        subjectTextTranslate: '.LETS_START_MATH_CALC'
                    }
                ],
                all: {
                    raccoonClassName: 'diagnostic-raccoon',
                    descriptionTranslate: '.DIAG_INTR_LETS_LEARN',
                    hideSectionQuestion: true
                },
                none: {
                    raccoonClassName: 'diagnostic-raccoon',
                    descriptionTranslate: '.DIAG_INTR_LETS_LEARN',
                    hideSectionQuestion: true
                }
            };
        }]);

        DiagnosticIntroSrvProvider.setActiveFn(['ENV', function(ENV) {
            return { id: ENV.ENGLISH };
        }]);

        UserGoalsServiceProvider.settings = {
            defaultSubjectScore: 600,
            minSchoolScore: 400,
            maxSchoolScore: 1600,
            scoreTitleTranslate: '.TOTAL_SCORE',
            goalsInfoTranslate: '.GOALS_INFO',
            subjects: [
                { name: 'math', bgClass: 'math-bg', svgIcon: 'math-section-icon', subjectTranslate: '.MATH' },
                { name: 'verbal', bgClass: 'verbal-bg', svgIcon: 'verbal-icon', subjectTranslate: '.VERBAL' }
            ]
        };
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
        this.dreamSchoolJsonUrl = "./onBoarding/mock/dreamSchools.json";
        this.promiseTimeOut = 5000;
        this.MATH = 0; // mock subject id from enum
        this.ENGLISH = 7;
        this.READING = 10;
        this.SCIENCE = 2;
        this.ALL = 'all';
        this.NONE = 'none';
    });
