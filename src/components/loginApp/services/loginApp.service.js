(function (angular) {
    'use strict';

    var APPS = {
        SAT: {
            id: 'SAT',
            name: 'SAT'
        },
        ACT: {
            id: 'ACT',
            name: 'ACT'
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
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'sat_app',
        studentAppName: 'sat_app',
        dashboardAppName: 'sat_dashboard'
    };
    ALL_ENV_CONFIG.prod[APPS.SAT.id] = {
        fbDataEndPoint: 'https://sat2-prod.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-prod.firebaseio.com/',
        backendEndpoint: 'https://znk-web-backend-prod.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'sat_app',
        studentAppName: 'sat_app',
        dashboardAppName: 'sat_dashboard'
    };
    ALL_ENV_CONFIG.dev[APPS.ACT.id] = {
        fbDataEndPoint: 'https://act-dev.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/',
        backendEndpoint: 'https://znk-web-backend-dev.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'act_app',
        studentAppName: 'act_app',
        dashboardAppName: 'act_dashboard'
    };
    ALL_ENV_CONFIG.prod[APPS.ACT.id] = {
        fbDataEndPoint: 'https://act-prod.firebaseio.com/',
        fbGlobalEndPoint: 'https://znk-prod.firebaseio.com/',
        backendEndpoint: 'https://znk-web-backend-prod.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'act_app',
        studentAppName: 'act_app',
        dashboardAppName: 'act_dashboard'
    };

    angular.module('znk.infra-web-app.loginApp').provider('LoginAppSrv', function () {
        var env = 'dev';
        this.setEnv = function (newEnv) {
            env = newEnv;
        };

        this.$get = function ($q, $http, $log) {
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

            LoginAppSrv.APPS = APPS;

            LoginAppSrv.USER_CONTEXT = USER_CONTEXT;

            LoginAppSrv.logout = function (appContext) {
                var globalRef = _getGlobalRef(appContext);
                var appRef = _getAppRef(appContext);
                globalRef.unauth();
                appRef.unauth();
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
                        return LoginAppSrv.login(appContext, userContext, formData).then(function (res) {
                            isSignUpInProgress = false;

                            _addFirstRegistrationRecord(appContext, userContext);

                            return res;
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
