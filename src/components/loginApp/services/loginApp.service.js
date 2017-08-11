(function (angular) {
    'use strict';

    var APPS = {
        SAT: {
            id: 'SAT',
            name: 'SAT',
            className: 'sat'
        },
        SATSM: {
            id: 'SATSM',
            name: 'SAT Math',
            className: 'satsm'
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
        },
        MYZINKERZ: {
            id: 'MYZINKERZ',
            name: 'MYZINKERZ',
            className: 'myzinkerz'
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

        this.getEnv = function () {
            return env;
        };

        this.$get = function ($q, $http, $log, $window, $location, SatellizerConfig, InvitationKeyService, PromoCodeSrv, AllEnvs) {
            'ngInject';

            var LoginAppSrv = {};

            function _getAppEnvConfig(appContext) {
                return AllEnvs[env][appContext];
            }

            function _getCurrentEnv(){
                return env;
            }

           /* function _getAppScopeName(userContext, appEnvConfig) {
                return (userContext === USER_CONTEXT.TEACHER) ? appEnvConfig.dashboardAppName : appEnvConfig.studentAppName;
            }*/

            function checkExistFirebaseApp(appContext) {
                var existApp;
                window.firebase.apps.forEach(function (app) {
                    if (app.name.toLowerCase() === appContext.toLowerCase()) {
                        existApp = app;
                    }
                });
                return  existApp;
            }

            function _getGlobalRef(appContext) {
                var existApp = checkExistFirebaseApp(appContext);
                if(existApp) {
                   return  existApp;
                }

                var appEnvConfig = _getAppEnvConfig(appContext);
                var config = {
                    apiKey: appEnvConfig.firbase_auth_config.apiKey,
                    authDomain:  appEnvConfig.firbase_auth_config.authDomain,
                    databaseURL: appEnvConfig.firbase_auth_config.databaseURL,
                    projectId: appEnvConfig.firbase_auth_config.projectId,
                    storageBucket: appEnvConfig.firbase_auth_config.storageBucket,
                    messagingSenderId: appEnvConfig.firbase_auth_config.messagingSenderId
                };
                return window.firebase.initializeApp(config, 'myzinkerz');
            }

            function _getAppRef(appContext) {
                var existApp = checkExistFirebaseApp(appContext);
                if(existApp) {
                    return  existApp;
                }
                var appEnvConfig = _getAppEnvConfig(appContext);
                var config = {
                    apiKey: appEnvConfig.firebase_apiKey,
                    authDomain:  appEnvConfig.firebase_projectId + ".firebaseapp.com",
                    databaseURL: appEnvConfig.fbDataEndPoint,
                    projectId: appEnvConfig.firebase_projectId,
                    storageBucket: appEnvConfig.firebase_projectId + ".appspot.com",
                    messagingSenderId: appEnvConfig.messagingSenderId
                };
                return window.firebase.initializeApp(config, 'dataFireBase');
            }

            function _getUserContextRef(appContext, userContext) {
                var appRef = _getAppRef(appContext, userContext);
                var appEnvConfig = _getAppEnvConfig(appContext);
                var prefix = userContext === USER_CONTEXT.STUDENT ? appEnvConfig.studentAppName : appEnvConfig.dashboardAppName;

                return appRef.database.ref(prefix);
            }

            function _addFirstRegistrationRecord(appContext, userContext) {
                var userContextAppRef = _getUserContextRef(appContext, userContext);
                var auth = userContextAppRef.getAuth();
                var firstLoginRef = userContextAppRef.child('firstLogin/' + auth.uid);
                return firstLoginRef.set(Firebase.ServerValue.TIMESTAMP);
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

                var urlParams = '';
                var questionOrAmpersandSymbol = '?';

                var invitationKey = InvitationKeyService.getInvitationKey();
                if (angular.isDefined(invitationKey) && invitationKey !== null) {
                    urlParams += (questionOrAmpersandSymbol + 'iid=' + invitationKey);
                    questionOrAmpersandSymbol = '&';
                }

                var promoCode = PromoCodeSrv.getPromoCodeToUpdate();
                if (angular.isDefined(promoCode) && promoCode !== null) {
                    urlParams +=  (questionOrAmpersandSymbol + 'pcid=' + promoCode);
                }

                var search = $location.search();
                var planId = angular.isDefined(search.planId) ? search.planId : null;
                if (angular.isDefined(planId) && planId !== null) {
                    urlParams +=  (questionOrAmpersandSymbol + 'planId=' + planId);
                }

                if(urlParams !== ''){
                    urlParams = '#' + urlParams;
                }

                if (appName.toLowerCase().indexOf('myzinkerz') === -1) {
                    appName = appName + '/web-app';
                }

                $window.location.href = $window.location.host.indexOf('localhost') > -1 ? "//" + $window.location.host + urlParams : "//" + $window.location.host + '/' + appName + urlParams;
            }

            function _getUserProfile(appContext, userContext) {
                var globalRef = _getGlobalRef(appContext, userContext);
                var auth = globalRef.auth().currentUser;
                var userProfileRef = globalRef.database.ref('users/' + auth.uid + '/profile');
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
                var appEnvConfig = _getAppEnvConfig(appContext);
                var znkRef = _getGlobalRef(appContext, userContext);
                var auth = znkRef.auth().currentUser;
                var updateProfileProms = [];
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

                updateProfileProms.push(znkRef.databse.ref('users/' + auth.uid).update(profile));
                if (appEnvConfig.setUserProfileTwice){
                    var appRef = _getAppRef(appContext, userContext);
                    updateProfileProms.push(appRef.database.ref('users/' + auth.uid).update(profile));
                }
                return $q.all(updateProfileProms)
                    .catch(function (err) {
                        $log.error(err);
                });
            }

            function _createAuthWithCustomToken(refDB, token) {
                return refDB.auth().signInWithCustomToken(token).catch(function (error) {
                    $log.error('LoginAppSrv createAuthWithCustomToken: error=' + error);
                });
            }

            function _userDataForAuthAndDataFb(data, appContext, userContext) {
                var refAuthDB = _getGlobalRef(appContext, userContext);
                var refDataDB = _getAppRef(appContext, userContext);
                var proms = [
                    LoginAppSrv.createAuthWithCustomToken(refAuthDB, data.authToken),
                    LoginAppSrv.createAuthWithCustomToken(refDataDB, data.dataToken)
                ];
                return $q.all(proms);
            }

            function _logout(appContext, userContext) {
                var globalRef = _getGlobalRef(appContext, userContext);
                var appRef = _getAppRef(appContext, userContext);
                globalRef.auth().signOut();
                appRef.auth().signOut();
            }

            function _setSocialProvidersConfig(providers, appContent) {
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
                    if (provider === 'live') {
                        providerConfig.redirectUri = (env.redirectLive) ? $window.location.protocol + env.redirectLive : $window.location.origin + '/';
                        // emails supose to be default scope, add it just to make sure, it still microsoft ;)
                        providerConfig.scope = ['wl.emails'];
                    }
                });
            }

            function _resetPassword(appId, email, userContext) {
                var globalRef = _getGlobalRef(appId, userContext);
                return globalRef.auth().sendPasswordResetEmail(email, function (error) {
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
            }

            /**
             * params:
             *  appContext: ACT/SAT etc (APPS constant)
             *  userContext: 1,2 (USER_CONTEXT constant)
             *  formData: email & password
             */
            LoginAppSrv.login = (function () {
                var isLoginInProgress;

                return function (appContext, userContext, formData, signUp) {
                    if (isLoginInProgress) {
                        var errMsg = 'login already in progress';
                        $log.debug(errMsg);
                        return $q.reject(errMsg);
                    }

                    LoginAppSrv.logout(appContext, userContext);

                    isLoginInProgress = true;

                    var globalRef = _getGlobalRef(appContext, userContext);
                    return globalRef.auth().signInWithEmailAndPassword(formData.email, formData.password).then(function (authData) {
                        var currentUser = globalRef.auth().currentUser;
                        var appEnvConfig = _getAppEnvConfig(appContext);
                        var postUrl = appEnvConfig.backendEndpoint + 'firebase/token';
                        var postData = {
                            email: authData.email,
                            uid: currentUser.uid,
                            fbDataEndPoint: appEnvConfig.fbDataEndPoint,
                            fbEndpoint: appEnvConfig.fbGlobalEndPoint,
                            auth: appEnvConfig.dataAuthSecret,
                            token: authData.refreshToken
                        };

                        return $http.post(postUrl, postData).then(function (token) {
                            var appRef = _getAppRef(appContext, userContext);
                            return appRef.auth().signInWithCustomToken(token.data).then(function (res) {
                                isLoginInProgress = false;
                                if(!signUp){
                                    _redirectToPage(appContext, userContext);
                                }
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
                    return globalRef.auth().createUserWithEmailAndPassword(formData.email, formData.password).then(function () {
                        var signUp = true;
                        return LoginAppSrv.login(appContext, userContext, formData, signUp).then(function (userAuth) {
                            $log.debug('LoginAppSrv: User signup: ' + userAuth.uid);
                            isSignUpInProgress = false;
                            var userProfile = {
                                email: formData.email,
                                nickname: formData.nickname,
                                provider: 'custom'
                            };
                            var saveProfileProm = LoginAppSrv.writeUserProfile(userProfile, appContext, userContext, true);
                            return saveProfileProm.then(function () {
                                _redirectToPage(appContext, userContext);
                            });
                        });
                    }).catch(function (err) {
                        isSignUpInProgress = false;
                        return $q.reject(err);
                    });
                };
            })();

            LoginAppSrv.APPS = APPS;
            LoginAppSrv.USER_CONTEXT = USER_CONTEXT;
            LoginAppSrv.logout = _logout;
            LoginAppSrv.getCurrentEnv = _getCurrentEnv;
            LoginAppSrv.getUserProfile = _getUserProfile;
            LoginAppSrv.writeUserProfile = _writeUserProfile;
            LoginAppSrv.createAuthWithCustomToken = _createAuthWithCustomToken;
            LoginAppSrv.userDataForAuthAndDataFb = _userDataForAuthAndDataFb;
            LoginAppSrv.addFirstRegistrationRecord = _addFirstRegistrationRecord;
            LoginAppSrv.resetPassword = _resetPassword;
            LoginAppSrv.redirectToPage = _redirectToPage;
            LoginAppSrv.setSocialProvidersConfig = _setSocialProvidersConfig;

            return LoginAppSrv;
        };
    });
})(angular);
