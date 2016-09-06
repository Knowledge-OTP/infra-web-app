(function (angular) {
    'use strict';

    var APPS = {
        SAT: {
            id: 'SAT',
            name: 'SAT',
            className: 'sat'
        },
        ACT: {
            id: 'ACT',
            name: 'ACT',
            className: 'act'
        },
        TOEFL: {
            id: 'TOEFL',
            name: 'TOEFL',
            className: 'toefl'
        }
    };

    var USER_CONTEXT = {
        TEACHER: 1,
        STUDENT: 2
    };

    var ALL_ENV_CONFIG = {
        'dev': {},
        'prod': {}
    };
    ALL_ENV_CONFIG.dev[APPS.SAT.id] = {
        fbDataEndPoint: 'https://sat-dev.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/',
        backendEndpoint: 'https://znk-web-backend-dev.azurewebsites.net/',
        facebookAppId: '1624086287830120',
        googleAppId: '1008364992567-hpchkt4nuo4eosjfrbpqrm1ruamg62nj.apps.googleusercontent.com',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'sat_app',
        studentAppName: 'sat_app',
        dashboardAppName: 'sat_dashboard'
    };
    ALL_ENV_CONFIG.prod[APPS.SAT.id] = {
        fbDataEndPoint: 'https://sat2-prod.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-prod.firebaseio.com/',
        backendEndpoint: 'https://znk-web-backend-prod.azurewebsites.net/',
        facebookAppId: '1576342295937853',
        googleAppId: '1008364992567-gpi1psnhk0t41bf8jtm86kjc74c0if7c.apps.googleusercontent.com',
        redirectFacebook: '//www.zinkerz.com/sat/web-app',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'sat_app',
        studentAppName: 'sat_app',
        dashboardAppName: 'sat_dashboard'
    };
    ALL_ENV_CONFIG.dev[APPS.ACT.id] = {
        fbDataEndPoint: 'https://act-dev.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/',
        facebookAppId: '1557255967927879',
        googleAppId: '144375962953-sundkbnv8ptac26bsnokc74lo2pmo8sb.apps.googleusercontent.com',
        backendEndpoint: 'https://znk-web-backend-dev.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'act_app',
        studentAppName: 'act_app',
        dashboardAppName: 'act_dashboard'
    };
    ALL_ENV_CONFIG.prod[APPS.ACT.id] = {
        fbDataEndPoint: 'https://act-prod.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-prod.firebaseio.com/',
        facebookAppId: '1557254871261322',
        googleAppId: '144375962953-mga4p9d3qrgr59hpgunm2gmvi9b5p395.apps.googleusercontent.com',
        redirectFacebook: '//www.zinkerz.com/act/web-app',
        backendEndpoint: 'https://znk-web-backend-prod.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'act_app',
        studentAppName: 'act_app',
        dashboardAppName: 'act_dashboard'
    };
    ALL_ENV_CONFIG.dev[APPS.TOEFL.id] = {
        fbDataEndPoint: 'https://znk-toefl-dev.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/',
        facebookAppId: '1801767253393534',
        googleAppId: '144375962953-sundkbnv8ptac26bsnokc74lo2pmo8sb.apps.googleusercontent.com',
        backendEndpoint: 'https://znk-web-backend-dev.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'toefl_app',
        studentAppName: 'toefl_app',
        dashboardAppName: 'toefl_dashboard'
    };
    ALL_ENV_CONFIG.prod[APPS.TOEFL.id] = {
        fbDataEndPoint: 'https://znk-toefl-prod.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-prod.firebaseio.com/',
        facebookAppId: '1658075334429394',
        googleAppId: '144375962953-mga4p9d3qrgr59hpgunm2gmvi9b5p395.apps.googleusercontent.com',
        redirectFacebook: '//www.zinkerz.com/toefl-test-prep/',
        backendEndpoint: 'https://znk-web-backend-prod.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'toefl_app',
        studentAppName: 'toefl_app',
        dashboardAppName: 'toefl_dashboard'
    };
    /**
     * TODO: add toefl dev and prod vars
     */

    angular.module('znk.infra-web-app.loginApp').provider('LoginAppSrv', function () {
        var env = 'dev';
        this.setEnv = function (newEnv) {
            env = newEnv;
        };

        this.$get = function ($q, $http, $log, $window, SatellizerConfig) {
            'ngInject';

            var LoginAppSrv = {};

            function _getAppEnvConfig(appContext) {
                return ALL_ENV_CONFIG[env][appContext];
            }

            function _getGlobalRef(appContext) {
                var appEnvConfig = _getAppEnvConfig(appContext);
                return new Firebase(appEnvConfig.fbGlobalEndPoint, appEnvConfig.firebaseAppScopeName);
            }

            function _getAppRef(appContext) {
                var appEnvConfig = _getAppEnvConfig(appContext);
                return new Firebase(appEnvConfig.fbDataEndPoint, appEnvConfig.firebaseAppScopeName);
            }

            function _getUserContextRef(appContext, userContext) {
                var appRef = _getAppRef(appContext);

                var appEnvConfig = _getAppEnvConfig(appContext);
                var prefix = userContext === USER_CONTEXT.STUDENT ? appEnvConfig.studentAppName : appEnvConfig.dashboardAppName;

                return appRef.child(prefix);
            }

            function _addFirstRegistrationRecord(appContext, userContext) {
                var userContextAppRef = _getUserContextRef(appContext, userContext);
                var auth = userContextAppRef.getAuth();
                var firstLoginRef = userContextAppRef.child('firstLogin/' + auth.uid);
                return firstLoginRef.set(Firebase.ServerValue.TIMESTAMP);
            }

            function _getUserProfile(appContext){
                var appRef = _getAppRef(appContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid + '/profile');
                var deferred = $q.defer();
                userProfileRef.on('value', function(snapshot) {
                    var userProfile = snapshot.val() || {};
                    deferred.resolve(userProfile);
                }, function(err) {
                    $log.error('LoginAppSrv _getUserProfile: err=' + err);
                    deferred.reject(err);
                });
                return deferred.promise;
            }

            function _writeUserProfile(formData, appContext, customProfileFlag) {
                var appRef = _getAppRef(appContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid);
                var profile;
                if (customProfileFlag) {
                    profile = { profile: formData };
                } else {
                    profile =  {
                        profile: {
                            email: formData.email,
                            nickname: formData.nickname
                        }
                    };
                }
                return userProfileRef.update(profile).catch(function(err){
                    $log.error(err);
                });
            }

            function _redirectToPage(appContext) {
                if (!appContext) {
                    $log.error('appContext is not defined!', appContext);
                    return;
                }
                var appConfig = _getAppEnvConfig(appContext);
                var appName = appConfig.firebaseAppScopeName.substr(0, appConfig.firebaseAppScopeName.indexOf('_'));
                $window.location.href = "//" + $window.location.host + '/' + appName + '/web-app';
            }

            LoginAppSrv.createAuthWithCustomToken = function (refDB, token) {
                return refDB.authWithCustomToken(token).catch(function(error) {
                    $log.error('LoginAppSrv createAuthWithCustomToken: error=' + error);
                });
            };

            LoginAppSrv.userDataForAuthAndDataFb = function (data, appContext) {
                var refAuthDB = _getGlobalRef(appContext);
                var refDataDB = _getAppRef(appContext);
                var proms = [
                    LoginAppSrv.createAuthWithCustomToken(refAuthDB, data.authToken),
                    LoginAppSrv.createAuthWithCustomToken(refDataDB, data.dataToken)
                ];
                return $q.all(proms);
            };

            LoginAppSrv.APPS = APPS;

            LoginAppSrv.USER_CONTEXT = USER_CONTEXT;

            LoginAppSrv.logout = function (appContext) {
                var globalRef = _getGlobalRef(appContext);
                var appRef = _getAppRef(appContext);
                globalRef.unauth();
                appRef.unauth();
            };

            LoginAppSrv.getUserProfile = _getUserProfile;
            LoginAppSrv.addFirstRegistrationRecord = _addFirstRegistrationRecord;
            LoginAppSrv.writeUserProfile = _writeUserProfile;
            LoginAppSrv.redirectToPage = _redirectToPage;

            LoginAppSrv.setSocialProvidersConfig = function(providers, appContent) {
                var env = _getAppEnvConfig(appContent);
                angular.forEach(providers, function(provider) {
                    var providerConfig = SatellizerConfig.providers && SatellizerConfig.providers[provider];
                    if (providerConfig) {
                        providerConfig.clientId = env[provider + 'AppId'];
                        providerConfig.url = env.backendEndpoint + provider + '/code';
                    }
                    if (provider === 'facebook') {
                        providerConfig.redirectUri = (env.redirectFacebook) ? $window.location.protocol + env.redirectFacebook : $window.location.origin + '/';
                    }
                });
            };

            /**
             * params:
             *  appContext: ACT/SAT etc (APPS constant)
             *  userContext: 1,2 (USER_CONTEXT constant)
             *  formData: email & password
             */
            LoginAppSrv.login = (function () {
                var isLoginInProgress;

                return function (appContext, userContext, formData) {
                    if (isLoginInProgress) {
                        var errMsg = 'login already in progress';
                        $log.debug(errMsg);
                        return $q.reject(errMsg);
                    }

                    LoginAppSrv.logout(appContext);

                    isLoginInProgress = true;

                    var globalRef = _getGlobalRef(appContext);
                    return globalRef.authWithPassword(formData).then(function (authData) {
                        var appEnvConfig = _getAppEnvConfig(appContext);
                        var postUrl = appEnvConfig.backendEndpoint + 'firebase/token';
                        var postData = {
                            email: authData.password ? authData.password.email : '',
                            uid: authData.uid,
                            fbDataEndPoint: appEnvConfig.fbDataEndPoint,
                            fbEndpoint: appEnvConfig.fbGlobalEndPoint,
                            auth: appEnvConfig.dataAuthSecret,
                            token: authData.token
                        };

                        return $http.post(postUrl, postData).then(function (token) {
                            var appRef = _getAppRef(appContext);
                            return appRef.authWithCustomToken(token.data).then(function (res) {
                                isLoginInProgress = false;
                                _redirectToPage(appContext);
                                return res;
                            });
                        });
                    }).catch(function (err) {
                        isLoginInProgress = false;
                        return $q.reject(err);
                    });
                };
            })();
            /**
             * params:
             *  appContext: ACT/SAT etc (APPS constant)
             *  userContext: 1,2 (USER_CONTEXT constant)
             *  formData: email & password
             */
            LoginAppSrv.signup = (function () {
                var isSignUpInProgress;

                return function (appContext, userContext, formData) {
                    if (isSignUpInProgress) {
                        var errMsg = 'sign up already in progress';
                        $log.debug(errMsg);
                        return $q.reject(errMsg);
                    }

                    var globalRef = _getGlobalRef(appContext);
                    return globalRef.createUser(formData).then(function () {
                        return LoginAppSrv.login(appContext, userContext, formData).then(function () {
                            isSignUpInProgress = false;
                            _addFirstRegistrationRecord(appContext, userContext);
                            return _writeUserProfile(formData, appContext).then(function(){
                                _redirectToPage(appContext);
                            });
                        });
                    }).catch(function (err) {
                        isSignUpInProgress = false;
                        return $q.reject(err);
                    });
                };
            })();

            return LoginAppSrv;
        };
    });
})(angular);
