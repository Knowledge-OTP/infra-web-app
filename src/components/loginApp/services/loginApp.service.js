(function (angular) {
    'use strict';

    var APPS = {
        SAT: {
            id: 'SAT',
            name: 'SAT',
            className: 'sat'
        },
        TOEFL: {
            id: 'TOEFL',
            name: 'TOEFL',
            className: 'toefl'
        },
        ACT: {
            id: 'ACT',
            name: 'ACT',
            className: 'act'
        }
    };

    var USER_CONTEXT = {
        TEACHER: 1,
        STUDENT: 2
    };

    angular.module('znk.infra-web-app.loginApp').provider('LoginAppSrv', function () {
        var env = 'dev';
        this.setEnv = function (newEnv) {
            env = newEnv;
        };

        this.getEnv = function(){
            return env;
        };

        this.$get = function ($q, $http, $log, $window, SatellizerConfig, InvitationKeyService, PromoCodeSrv, AllEnvConfigSrv) {
            'ngInject';

            var LoginAppSrv = {};

            function _getAppEnvConfig(appContext) {
                return AllEnvConfigSrv[env][appContext];
            }

            function _getAppScopeName(userContext, appEnvConfig) {
                return (userContext === USER_CONTEXT.TEACHER) ? appEnvConfig.dashboardAppName : appEnvConfig.studentAppName;
            }

            function _getGlobalRef(appContext, userContext) {
                var appEnvConfig = _getAppEnvConfig(appContext);
                return new Firebase(appEnvConfig.fbGlobalEndPoint, _getAppScopeName(userContext, appEnvConfig));
            }

            function _getAppRef(appContext, userContext) {
                var appEnvConfig = _getAppEnvConfig(appContext);
                return new Firebase(appEnvConfig.fbDataEndPoint, _getAppScopeName(userContext, appEnvConfig));
            }

            function _getUserContextRef(appContext, userContext) {
                var appRef = _getAppRef(appContext, userContext);

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

            function _getUserProfile(appContext, userContext) {
                var appRef = _getAppRef(appContext, userContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid + '/profile');
                var deferred = $q.defer();
                userProfileRef.on('value', function (snapshot) {
                    var userProfile = snapshot.val() || {};
                    deferred.resolve(userProfile);
                }, function (err) {
                    $log.error('LoginAppSrv _getUserProfile: err=' + err);
                    deferred.reject(err);
                });
                return deferred.promise;
            }

            function _writeUserProfile(formData, appContext, userContext, customProfileFlag) {
                var appRef = _getAppRef(appContext, userContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid);
                var profile;
                if (customProfileFlag) {
                    profile = {profile: formData};
                } else {
                    profile = {
                        profile: {
                            email: formData.email,
                            nickname: formData.nickname
                        }
                    };
                }
                return userProfileRef.update(profile).catch(function (err) {
                    $log.error(err);
                });
            }

            function _redirectToPage(appContext, userContext) {
                if (!appContext) {
                    /**
                     * TODO: remove this check and write a new function appContextGetter that will do this check every time its called
                     */
                    $log.error('appContext is not defined!', appContext);
                    return;
                }
                var appConfig = _getAppEnvConfig(appContext);
                var appName = appConfig.firebaseAppScopeName.substr(0, appConfig.firebaseAppScopeName.indexOf('_'));
                if (userContext === USER_CONTEXT.TEACHER) {
                    appName = appName + '-educator';
                }

                var isParamsUrlToSend = false;

                var invitationKey = InvitationKeyService.getInvitationKey();
                var invitationPostFix = '';
                if (angular.isDefined(invitationKey) && invitationKey !== null) {
                    invitationPostFix = '&iid=' + invitationKey;
                    isParamsUrlToSend = true;
                }

                var promoCode = PromoCodeSrv.getPromoCodeToUpdate();
                var promoCodePostFix = '';
                if (angular.isDefined(promoCode) && promoCode !== null) {
                    promoCodePostFix = '&pcid=' + promoCode;
                    isParamsUrlToSend = true;
                }

                var parmasPrefix = isParamsUrlToSend ? '?' : '';
                $window.location.href = "//" + $window.location.host + '/' + appName + '/web-app' + parmasPrefix + invitationPostFix + promoCodePostFix;
            }

            LoginAppSrv.createAuthWithCustomToken = function (refDB, token) {
                return refDB.authWithCustomToken(token).catch(function (error) {
                    $log.error('LoginAppSrv createAuthWithCustomToken: error=' + error);
                });
            };

            LoginAppSrv.userDataForAuthAndDataFb = function (data, appContext, userContext) {
                var refAuthDB = _getGlobalRef(appContext, userContext);
                var refDataDB = _getAppRef(appContext, userContext);
                var proms = [
                    LoginAppSrv.createAuthWithCustomToken(refAuthDB, data.authToken),
                    LoginAppSrv.createAuthWithCustomToken(refDataDB, data.dataToken)
                ];
                return $q.all(proms);
            };

            LoginAppSrv.APPS = APPS;

            LoginAppSrv.USER_CONTEXT = USER_CONTEXT;

            LoginAppSrv.logout = function (appContext, userContext) {
                var globalRef = _getGlobalRef(appContext, userContext);
                var appRef = _getAppRef(appContext, userContext);
                globalRef.unauth();
                appRef.unauth();
            };

            LoginAppSrv.getUserProfile = _getUserProfile;
            LoginAppSrv.addFirstRegistrationRecord = _addFirstRegistrationRecord;
            LoginAppSrv.writeUserProfile = _writeUserProfile;
            LoginAppSrv.redirectToPage = _redirectToPage;

            LoginAppSrv.setSocialProvidersConfig = function (providers, appContent) {
                var env = _getAppEnvConfig(appContent);
                angular.forEach(providers, function (provider) {
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

            LoginAppSrv.resetPassword = function (appId, email, userContext) {
                var globalRef = _getGlobalRef(appId, userContext);
                return globalRef.resetPassword({
                    email: email
                }, function (error) {
                    if (error === null) {
                        $log.debug('Reset email was sent');
                    } else {
                        $log.debug('Email was not sent', error);
                    }
                }).then(function (res) {
                    return res;
                }).catch(function (error) {
                    return error;
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

                    LoginAppSrv.logout(appContext, userContext);

                    isLoginInProgress = true;

                    var globalRef = _getGlobalRef(appContext, userContext);
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
                            var appRef = _getAppRef(appContext, userContext);
                            return appRef.authWithCustomToken(token.data).then(function (res) {
                                isLoginInProgress = false;
                                _redirectToPage(appContext, userContext);
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

                    var globalRef = _getGlobalRef(appContext, userContext);
                    return globalRef.createUser(formData).then(function () {
                        return LoginAppSrv.login(appContext, userContext, formData).then(function () {
                            isSignUpInProgress = false;
                            _addFirstRegistrationRecord(appContext, userContext);
                            return _writeUserProfile(formData, appContext, userContext).then(function () {
                                _redirectToPage(appContext, userContext);
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
