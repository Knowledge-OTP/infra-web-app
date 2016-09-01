(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('LoginAppSrv',
        function (/*$window, $firebaseAuth, ENV, $q, $timeout, $rootScope, $http, $log, $injector, UserProfileService*/) {
            var self = this;

            var refAuthDB = new $window.Firebase(ENV.fbGlobalEndPoint, ENV.firebaseAppScopeName);
            var refDataDB = new $window.Firebase(ENV.fbDataEndPoint, ENV.firebaseAppScopeName);
            var fbAuth = $firebaseAuth(refAuthDB);

            this.login = function (loginData) {
                var ref = new Firebase(ENV.fbGlobalEndPoint, ENV.firebaseAppScopeName);
                return ref.authWithPassword(loginData).then(function (authData) {
                    var postUrl = ENV.backendEndpoint + 'firebase/token';
                    var postData = {
                        email: authData.password ? authData.password.email : '',
                        uid: authData.uid,
                        fbDataEndPoint: ENV.fbDataEndPoint,
                        fbEndpoint: ENV.fbGlobalEndPoint,
                        auth: ENV.dataAuthSecret,
                        token: authData.token
                    };

                    return $http.post(postUrl, postData).then(function (token) {
                        var refDataDB = new Firebase(ENV.fbDataEndPoint, ENV.firebaseAppScopeName);
                        refDataDB.authWithCustomToken(token.data).then(function () {
                            var appUrl = ENV.redirectLogin;
                            $window.location.replace(appUrl);
                        });
                    });
                });
            };

            this.signup = function (signupData) {
                var self = this;

                $log.debug(signupData);
                // if (AuthHelperService.isDomainExclude(this.registration.email)) {
                //     alert('invalid email!');
                //     return;
                // }

                self.saveRegistration(this.registration, true)
                    .then(function () {
                        UserProfileService.getProfile().then(function (userProfile) {
                            userProfile.email = self.registration.email;
                            userProfile.nickname = self.registration.nickname;

                            // UserProfileService.setProfile(userProfile).then(function () {
                            //     InvitationKeyService.navigateWithInvitationKey();
                            // });
                        });
                    })
                    .catch(function (err) {
                        $log.error(err);
                        // if (err.code === 'NETWORK_ERROR') {
                        //     self.signup_error = AuthHelperService.errorMessages.NO_INTERNET_CONNECTION_ERR;
                        // } else if (err.code === 'EMAIL_TAKEN') {
                        //     self.email_error = AuthHelperService.errorMessages.EMAIL_EXIST;
                        // } else {
                        //     self.email_error = AuthHelperService.errorMessages.INVALID_EMAIL;
                        // }
                    });
            };


            // From AuthService

            this.saveRegistration = function (registration, login) {
                var registerInProgress = true;
                var dfd = $q.defer();
                this.logout(true);

                var timeoutPromise = $timeout(function () {
                    if (registerInProgress) {
                        dfd.reject('timeout');
                    }
                }, ENV.promiseTimeOut);

                registration.profile = {};

                fbAuth.$createUser(registration).then(function () {
                    registerInProgress = false;
                    $timeout.cancel(timeoutPromise);

                    if (login) {
                        self.login({
                            email: registration.email,
                            password: registration.password
                        }).then(function (loginData) {
                            self.registerFirstLogin();
                            dfd.resolve(loginData);
                        }, function (err) {
                            dfd.reject(err);
                        });
                    } else {
                        dfd.resolve();
                    }
                }, function (error) {
                    $timeout.cancel(timeoutPromise);
                    dfd.reject(error);
                });
                return dfd.promise;
            };

            this.login = function (loginData) {
                var deferred = $q.defer();

                fbAuth.$unauth();

                fbAuth.$authWithPassword(loginData).then(function (authData) {
                    $log.debug('authSrv::login(): uid=' + authData.uid);
                    _$onAuth(authData).then(function () {
                        deferred.resolve(authData);
                    });
                }).catch(function (err) {
                    self.logout();
                    deferred.reject(err);
                });

                return deferred.promise;
            };

            this.logout = function () {
                $rootScope.$broadcast('auth:beforeLogout');
                fbAuth.$unauth();

                var actAuth = $firebaseAuth(refDataDB);
                actAuth.$unauth();
            };

            this.forgotPassword = function (forgotPasswordData) {
                return fbAuth.$resetPassword(forgotPasswordData);
            };

            this.changePassword = function (changePasswordData) {
                var authData = this.getAuth();
                if (authData && authData.password) {
                    changePasswordData.email = authData.password.email;
                    return fbAuth.$changePassword(changePasswordData);
                }
                return $q.reject();
            };

            this.getAuth = function () {
                return refAuthDB.getAuth();
            };

            this.createAuthWithCustomToken = function (refDB, token) {
                var deferred = $q.defer();
                refDB.authWithCustomToken(token, function (error, userData) {
                    if (error) {
                        deferred.reject(error);
                    }
                    $log.debug('createAuthWithCustomToken: uid=' + userData.uid);
                    deferred.resolve(userData);
                });
                return deferred.promise;
            };

            this.userDataForAuthAndDataFb = function (data) {
                var proms = [
                    this.createAuthWithCustomToken(refAuthDB, data.authToken),
                    this.createAuthWithCustomToken(refDataDB, data.dataToken)
                ];
                return $q.all(proms);
            };

            function _$onAuth(data) {
                var _loginAuthData = data;

                if (_loginAuthData) {
                    return _dataLogin(_loginAuthData).then(function () {
                        $rootScope.$broadcast('auth:login', _loginAuthData);
                    });
                }
                $rootScope.$broadcast('auth:logout');
                return $q.when();
            }

            function _dataLogin() {
                var postUrl = ENV.backendEndpoint + 'firebase/token';
                var authData = refAuthDB.getAuth();
                var postData = {
                    email: authData.password ? authData.password.email : '',
                    uid: authData.uid,
                    fbDataEndPoint: ENV.fbDataEndPoint,
                    fbEndpoint: ENV.fbGlobalEndPoint,
                    auth: ENV.dataAuthSecret,
                    token: authData.token
                };

                return $http.post(postUrl, postData).then(function (token) {
                    var defer = $q.defer();
                    refDataDB.authWithCustomToken(token.data, function (error, userAuthData) {
                        if (error) {
                            defer.reject(error);
                        }
                        $log.debug('authSrv::login(): uid=' + userAuthData.uid);
                        defer.resolve(userAuthData);
                    });
                    return defer.promise;
                });
            }

            this.registerFirstLogin = function () {
                var ActStorageSrv = $injector.get('ActStorageSrv');
                var StorageSrv = $injector.get('StorageSrv');
                var firstLoginPath = 'firstLogin/' + StorageSrv.variables.uid;
                return ActStorageSrv.get(firstLoginPath).then(function (userFirstLoginTime) {
                    if (angular.equals(userFirstLoginTime, {})) {
                        ActStorageSrv.set(firstLoginPath, Date.now());
                    }
                });
            };

        }
    );
})(angular);
