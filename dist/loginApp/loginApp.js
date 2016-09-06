(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ngMaterial',
        'znk.infra.user',
        'satellizer'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg',
                'facebook-icon': 'components/loginApp/svg/facebook-icon.svg',
                'google-icon': 'components/loginApp/svg/google-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(window, angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp', [
        '$translatePartialLoader', 'LoginAppSrv', '$location',
        function ($translatePartialLoader, LoginAppSrv, $location) {
            return {
                templateUrl: 'components/loginApp/templates/loginApp.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginApp');

                    scope.d = {
                        availableApps: LoginAppSrv.APPS,
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        userContext: LoginAppSrv.USER_CONTEXT.STUDENT
                    };

                    var socialProvidersArr = ['facebook', 'google'];

                    LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                    scope.currentUserContext =  'student';
                    scope.currentForm = 'signup';

                    scope.selectApp = function(app) {
                        scope.d.appContext = app;
                        LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);
                    };

                    scope.changeCurrentForm = function (currentForm) {
                        scope.currentForm = currentForm;
                    };

                    scope.changeUserContext = function (context) {
                        scope.d.userContext = context;
                        if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.STUDENT) {
                            scope.currentUserContext =  'student';
                        } else if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.TEACHER) {
                            scope.currentUserContext =  'teacher';
                        }
                    };

                    // App select menu
                    var originatorEv;
                    scope.openMenu = function($mdOpenMenu, ev) {
                        originatorEv = ev;
                        $mdOpenMenu(ev);
                    };

                    var search = $location.search();
                    if (!angular.equals(search, {}) && (search.app || search.state)) {
                        if (search.app) {
                            angular.forEach(LoginAppSrv.APPS, function(app, index){
                                if (index.toLowerCase() === search.app.toLowerCase()) {
                                    scope.selectApp(app);
                                }
                            });
                        }
                        if (search.state) {
                            scope.changeCurrentForm(search.state);
                        }
                        $location.search('app', null);
                        $location.search('state', null);
                    }
                }
            };
        }
    ]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginForm',
        ["$translatePartialLoader", "LoginAppSrv", "$window", function ($translatePartialLoader, LoginAppSrv, $window) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                    };

                    scope.loginSubmit = function(){
                        if (!scope.d.loginFormData) {
                            $window.alert('form is empty!');
                            return;
                        }
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData).catch(function(err){
                            console.error(err);
                            $window.alert(err);
                        });
                    };
                }
            };
        }]
    );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm',
        ["$translatePartialLoader", "LoginAppSrv", "$window", function ($translatePartialLoader, LoginAppSrv, $window) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT
                    };

                    scope.signupSubmit = function(){
                        if (!scope.d.signupFormData) {
                            $window.alert('form is empty!');
                            return;
                        }
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData).catch(function(err){
                            console.error(err);
                            $window.alert(err);
                        });
                    };
                }
            };
        }]
    );
})(angular);


/* jshint ignore:start */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').controller('OathLoginDrvController',
        ["LoginAppSrv", "$window", "$log", "$auth", function(LoginAppSrv, $window, $log, $auth) {
            'ngInject';

            var vm = this;

            this.socialAuth = function (provider) {
                vm.loading = {};
                var loadingProvider = vm.loading[provider] = {};
                loadingProvider.startLoader = true;
                $auth.authenticate(provider).then(function (response) {
                    return LoginAppSrv.userDataForAuthAndDataFb(response.data, vm.appContext.id);
                }).then(function (results) {
                    var userDataAuth = results[0].auth;

                    LoginAppSrv.getUserProfile(vm.appContext.id).then(function (userProfile) {
                        var updateProfile = false;

                        if (!userProfile.email && userDataAuth.email) {
                            userProfile.email = userDataAuth.email;
                            updateProfile = true;
                        }
                        if (!userProfile.nickname && (userDataAuth.nickname || userDataAuth.name)) {
                            userProfile.nickname = userDataAuth.nickname || userDataAuth.name;
                            updateProfile = true;
                        }
                        if (!userProfile.provider) {
                            userProfile.provider = provider;
                            updateProfile = true;
                        }

                        LoginAppSrv.addFirstRegistrationRecord(vm.appContext.id, vm.userContext);

                        loadingProvider.fillLoader = true;
                        loadingProvider.startLoader = loadingProvider.fillLoader = false;

                        if (updateProfile) {
                            LoginAppSrv.writeUserProfile(userProfile, vm.appContext.id, true).then(function () {
                                LoginAppSrv.redirectToPage(vm.appContext.id);
                            });
                        } else {
                            LoginAppSrv.redirectToPage(vm.appContext.id);
                        }
                    });
                }).catch(function (error) {
                    $log.error('OathLoginDrvController socialAuth', error);
                });
            };

        }]);
})(angular);
/* jshint ignore:end */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('oathLoginDrv', function() {
        'ngInject';
        return {
            scope: {
                providers: '=',
                appContext: '<',
                userContext: '<'
            },
            restrict: 'E',
            templateUrl: 'components/loginApp/templates/oathLogin.template.html',
            controller: 'OathLoginDrvController',
            bindToController: true,
            controllerAs: 'vm'
        };
    });
})(angular);

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

    angular.module('znk.infra-web-app.loginApp').provider('LoginAppSrv', function () {
        var env = 'dev';
        this.setEnv = function (newEnv) {
            env = newEnv;
        };

        this.$get = ["$q", "$http", "$log", "$window", "SatellizerConfig", function ($q, $http, $log, $window, SatellizerConfig) {
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

            function _writeUserProfile(formData, appContext, customProfileFlag){
                var appRef = _getAppRef(appContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid + '/profile');
                var profile;
                if (customProfileFlag) {
                    profile = formData;
                } else {
                    profile =  {
                        email: formData.email,
                        nickname: formData.nickname
                    };
                }
                return userProfileRef.update(profile).catch(function(err){
                    $log.error(err);
                });
            }

            function _redirectToPage(appContext) {
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
                                _redirectToPage();
                            });
                        });
                    }).catch(function (err) {
                        isSignUpInProgress = false;
                        return $q.reject(err);
                    });
                };
            })();

            return LoginAppSrv;
        }];
    });
})(angular);

angular.module('znk.infra-web-app.loginApp').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginApp/svg/facebook-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-203 228.4 22.4 48.3\">\n" +
    "<path d=\"M-180.6,244h-7.6v-5c0-1.9,1.2-2.3,2.1-2.3c0.9,0,5.4,0,5.4,0v-8.3l-7.4,0c-8.2,0-10.1,6.2-10.1,10.1v5.5h-4.8v8.5h4.8\n" +
    "	c0,10.9,0,24.1,0,24.1h10c0,0,0-13.3,0-24.1h6.8L-180.6,244z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/form-envelope.svg",
    "<svg\n" +
    "    class=\"login-form-envelope-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 190.2 143.7\">\n" +
    "    <style>\n" +
    "        .login-form-envelope-svg{\n" +
    "            width: 20px;\n" +
    "            stroke: #CACACA;\n" +
    "            fill: none;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M174.7,141.2H15.4c-7.1,0-12.9-5.8-12.9-12.9V15.4c0-7.1,5.8-12.9,12.9-12.9h159.3c7.1,0,12.9,5.8,12.9,12.9\n" +
    "		v112.8C187.7,135.3,181.9,141.2,174.7,141.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M4.1,7.3l77.3,75.1c7.6,7.4,19.8,7.4,27.4,0l77.3-75.1\"/>\n" +
    "	<line class=\"st0\" x1=\"77\" y1=\"78\" x2=\"7.7\" y2=\"135.5\"/>\n" +
    "	<line class=\"st0\" x1=\"112.8\" y1=\"78\" x2=\"182.1\" y2=\"135.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/form-lock.svg",
    "<svg class=\"locked-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .locked-svg{\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/google-icon.svg",
    "<svg x=\"0px\" version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 604.35 604.35\"\n" +
    "     class=\"google-icon-wrapper\">\n" +
    "    <style>\n" +
    "        .google-icon-wrapper{\n" +
    "            fill: #fff;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g id=\"google-plus\">\n" +
    "		<path d=\"M516.375,255v-76.5h-51V255h-76.5v51h76.5v76.5h51V306h76.5v-51H516.375z M320.025,341.7l-28.051-20.4\n" +
    "			c-10.2-7.649-20.399-17.85-20.399-35.7s12.75-33.15,25.5-40.8c33.15-25.5,66.3-53.55,66.3-109.65c0-53.55-33.15-84.15-51-99.45\n" +
    "			h43.35l30.6-35.7h-158.1c-112.2,0-168.3,71.4-168.3,147.9c0,58.65,45.9,122.4,127.5,122.4h20.4c-2.55,7.65-10.2,20.4-10.2,33.15\n" +
    "			c0,25.5,10.2,35.7,22.95,51c-35.7,2.55-102,10.2-150.45,40.8c-45.9,28.05-58.65,66.3-58.65,94.35\n" +
    "			c0,58.65,53.55,114.75,168.3,114.75c137.7,0,204.001-76.5,204.001-150.449C383.775,400.35,355.725,372.3,320.025,341.7z\n" +
    "			 M126.225,109.65c0-56.1,33.15-81.6,68.85-81.6c66.3,0,102,89.25,102,140.25c0,66.3-53.55,79.05-73.95,79.05\n" +
    "			C159.375,247.35,126.225,168.3,126.225,109.65z M218.024,568.65c-84.15,0-137.7-38.25-137.7-94.351c0-56.1,51-73.95,66.3-81.6\n" +
    "			c33.15-10.2,76.5-12.75,84.15-12.75s12.75,0,17.85,0c61.2,43.35,86.7,61.2,86.7,102C335.324,530.4,286.875,568.65,218.024,568.65z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/templates/loginApp.directive.html",
    "<div class=\"login-app\" ng-class=\"{\n" +
    "        student: d.userContext === d.userContextObj.STUDENT,\n" +
    "        educator: d.userContext === d.userContextObj.TEACHER,\n" +
    "        sat: d.appContext === d.availableApps.SAT,\n" +
    "        act: d.appContext === d.availableApps.ACT,\n" +
    "        toefl: d.appContext === d.availableApps.TOEFL,\n" +
    "    }\">\n" +
    "    <header>\n" +
    "        <a class=\"logo\" href=\"//www.zinkerz.com\"></a>\n" +
    "\n" +
    "        <div class=\"app-select\" ng-cloak>\n" +
    "            <md-menu md-offset=\"-100 80\" md-no-ink>\n" +
    "                <md-button aria-label=\"Open App Select Menu\" class=\"md-icon-button\" ng-click=\"openMenu($mdOpenMenu, $event)\">\n" +
    "                    <md-icon class=\"material-icons expand-menu\">expand_more</md-icon>\n" +
    "                    <div class=\"app-img-holder {{d.appContext.className}}\"></div>\n" +
    "                </md-button>\n" +
    "                <md-menu-content width=\"4\" class=\"app-select-menu\">\n" +
    "                    <md-menu-item ng-repeat=\"app in d.availableApps track by app.id\" ng-click=\"selectApp(app)\">\n" +
    "                        <div class=\"app-img-holder {{app.className}}\"></div>\n" +
    "                    </md-menu-item>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "\n" +
    "    </header>\n" +
    "    <div class=\"main\">\n" +
    "        <ng-switch on=\"currentForm\">\n" +
    "            <div class=\"login-container\" ng-switch-when=\"login\">\n" +
    "                <login-form app-context=\"d.appContext\"\n" +
    "                            user-context=\"d.userContext\">\n" +
    "                </login-form>\n" +
    "                <p class=\"go-to-signup\">\n" +
    "                    <span translate=\"SIGNUP_FORM.STUDENT.ALREADY_HAVE_ACCOUNT\" ng-if=\"d.userContext===d.userContextObj.STUDENT\"></span>\n" +
    "                    <span translate=\"SIGNUP_FORM.EDUCATOR.ALREADY_HAVE_ACCOUNT\" ng-if=\"d.userContext===d.userContextObj.TEACHER\"></span>\n" +
    "                    <a ng-click=\"changeCurrentForm('signup')\">Sign Up</a>\n" +
    "                </p>\n" +
    "            </div>\n" +
    "            <div class=\"signup-container\" ng-switch-when=\"signup\">\n" +
    "                <signup-form app-context=\"d.appContext\"\n" +
    "                             user-context=\"d.userContext\">\n" +
    "                </signup-form>\n" +
    "                <p class=\"go-to-login\">\n" +
    "                    <span translate=\"LOGIN_FORM.STUDENT.DONT_HAVE_AN_ACCOUNT\" ng-if=\"d.userContext===d.userContextObj.STUDENT\"></span>\n" +
    "                    <span translate=\"LOGIN_FORM.EDUCATOR.DONT_HAVE_AN_ACCOUNT\" ng-if=\"d.userContext===d.userContextObj.TEACHER\"></span>\n" +
    "                    <a ng-click=\"changeCurrentForm('login')\">Log In</a>\n" +
    "                </p>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "    </div>\n" +
    "    <footer>\n" +
    "        <ng-switch on=\"currentUserContext\">\n" +
    "            <div ng-switch-when=\"teacher\" class=\"switch-student-educator\">\n" +
    "                <h2>Check out our App for Students</h2>\n" +
    "                <a href=\"\" class=\"app-color\" ng-click=\"changeUserContext(d.userContextObj.STUDENT)\">Check out Zinkerz tools for teachers</a>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"student\" class=\"switch-student-educator\">\n" +
    "                <h2>Are you an educator?</h2>\n" +
    "                <a href=\"\" class=\"app-color\" ng-click=\"changeUserContext(d.userContextObj.TEACHER)\">Sign Up for Zinkerz Test Prep</a>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "    </footer>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/loginForm.directive.html",
    "<div class=\"form-container login\" translate-namespace=\"LOGIN_FORM\">\n" +
    "    <div class=\"title\" translate=\"LOGIN_FORM.STUDENT.LOGIN\" ng-if=\"userContext===d.userContextObj.STUDENT\"></div>\n" +
    "    <div class=\"title\" translate=\"LOGIN_FORM.EDUCATOR.LOGIN\" ng-if=\"userContext===d.userContextObj.TEACHER\"></div>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth\">\n" +
    "            <oath-login-drv\n" +
    "                app-context=\"d.appContext\"\n" +
    "                user-context=\"d.userContext\"\n" +
    "                providers=\"{facebook:true,google:true}\">\n" +
    "            </oath-login-drv>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <form novalidate ng-submit=\"loginSubmit()\">\n" +
    "        <div class=\"inputs-container\">\n" +
    "            <div class=\"input-wrapper\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"text\"\n" +
    "                       placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                       name=\"email\"\n" +
    "                       ng-model=\"d.loginFormData.email\">\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\">\n" +
    "                <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "                <input type=\"password\"\n" +
    "                       placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                       name=\"password\"\n" +
    "                       ng-model=\"d.loginFormData.password\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"submit-btn-wrapper\">\n" +
    "            <button type=\"submit\" translate=\".LOGIN_IN\" class=\"app-bg\" autofocus></button>\n" +
    "        </div>\n" +
    "        <!--<div class=\"forgot-pwd-wrapper\">-->\n" +
    "        <!--<span translate=\".FORGOT_PWD\"></span>-->\n" +
    "        <!--</div>-->\n" +
    "    </form>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/oathLogin.template.html",
    "<div class=\"btn-wrap\" translate-namespace=\"OATH_SOCIAL\">\n" +
    "    <button class=\"btn facebook-btn\"\n" +
    "            ng-click=\"vm.socialAuth('facebook')\"\n" +
    "            ng-if=\"vm.providers.facebook\"\n" +
    "            element-loader\n" +
    "            fill-loader=\"vm.loading.facebook.fillLoader\"\n" +
    "            show-loader=\"vm.loading.facebook.startLoader\"\n" +
    "            bg-loader=\"'#315880'\"\n" +
    "            precentage=\"50\"\n" +
    "            font-color=\"'#FFFFFF'\"\n" +
    "            bg=\"'#369'\">\n" +
    "        <svg-icon name=\"facebook-icon\"></svg-icon>\n" +
    "        <span translate=\".CONNECT_WITH_FB\"></span>\n" +
    "    </button>\n" +
    "    <button class=\"btn gplus-btn\"\n" +
    "            ng-click=\"vm.socialAuth('google')\"\n" +
    "            ng-if=\"vm.providers.google\"\n" +
    "            element-loader\n" +
    "            fill-loader=\"vm.loading.google.fillLoader\"\n" +
    "            show-loader=\"vm.loading.google.startLoader\"\n" +
    "            bg-loader=\"'#BD3922'\"\n" +
    "            precentage=\"50\"\n" +
    "            font-color=\"'#FFFFFF'\"\n" +
    "            bg=\"'#df4a31'\">\n" +
    "        <svg-icon name=\"google-icon\"></svg-icon>\n" +
    "        <span translate=\".CONNECT_WITH_GOOGLE\"></span>\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/signupForm.directive.html",
    "<div class=\"form-container signup\" translate-namespace=\"SIGNUP_FORM\">\n" +
    "    <div class=\"title\" translate=\".STUDENT.CREATE_ACCOUNT\" ng-if=\"userContext===d.userContextObj.STUDENT\"></div>\n" +
    "    <div class=\"title\" translate=\".EDUCATOR.CREATE_ACCOUNT\" ng-if=\"userContext===d.userContextObj.TEACHER\"></div>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth\">\n" +
    "            <oath-login-drv\n" +
    "                app-context=\"d.appContext\"\n" +
    "                user-context=\"d.userContext\"\n" +
    "                providers=\"{facebook:true,google:true}\">\n" +
    "            </oath-login-drv>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <form novalidate\n" +
    "          ng-submit=\"signupSubmit()\">\n" +
    "        <div class=\"inputs-container\">\n" +
    "            <div class=\"input-wrapper\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"text\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.NAME' | translate}}\"\n" +
    "                       name=\"nickname\"\n" +
    "                       ng-model=\"d.signupFormData.nickname\">\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"text\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.EMAIL' | translate}}\"\n" +
    "                       name=\"email\"\n" +
    "                       ng-model=\"d.signupFormData.email\">\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\">\n" +
    "                <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "                <input type=\"password\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.PASSWORD' | translate}}\"\n" +
    "                       name=\"password\"\n" +
    "                       ng-model=\"d.signupFormData.password\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"submit-btn-wrapper\">\n" +
    "            <button type=\"submit\" translate=\".SIGN_UP\" class=\"app-bg\" autofocus></button>\n" +
    "        </div>\n" +
    "        <p class=\"signup-disclaimer\" translate-values=\"{termsOfUseHref: vm.termsOfUseHref, privacyPolicyHref: vm.privacyPolicyHref}\" translate=\".DISCLAIMER\"></p>\n" +
    "        <!--<div class=\"forgot-pwd-wrapper\">-->\n" +
    "        <!--<span translate=\".FORGOT_PWD\"></span>-->\n" +
    "        <!--</div>-->\n" +
    "    </form>\n" +
    "</div>\n" +
    "");
}]);
