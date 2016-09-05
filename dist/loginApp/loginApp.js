(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ngMaterial',
        'satellizer',
        'znk.infra.user'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]).config([
        'InfraConfigSrvProvider',
        function (InfraConfigSrvProvider) {

            globalStorage.$inject = ["GlobalStorageSrv"];
            function globalStorage(GlobalStorageSrv) {
                'ngInject';
                return GlobalStorageSrv;
            }

            InfraConfigSrvProvider.setStorages(globalStorage);
        }
    ]);

})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp', [
        '$translatePartialLoader', 'LoginAppSrv',
        function ($translatePartialLoader, LoginAppSrv) {
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

                    scope.currentUserContext =  'student';
                    scope.currentForm = 'signup';
                    scope.selectApp = function(app) {
                        scope.d.appContext = app;
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

    angular.module('znk.infra-web-app.loginApp').directive('loginForm', [
        '$translatePartialLoader', 'LoginAppSrv',
        function ($translatePartialLoader, LoginAppSrv) {
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('loginForm');

                    scope.d = {};

                    scope.loginSubmit = function(){
                        if (!scope.d.loginFormData) {
                            return;
                        }
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
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

    angular.module('znk.infra-web-app.loginApp').directive('signupForm', [
        '$translatePartialLoader', 'LoginAppSrv',
        function ($translatePartialLoader, LoginAppSrv) {
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('signupForm');

                    scope.d = {};

                    scope.signupSubmit = function(){
                        if (!scope.d.signupFormData) {
                            return;
                        }
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);


/* jshint ignore:start */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').controller('OathLoginDrvController',
        ["$window", "$log", "$auth", "$timeout", "$filter", function($window, $log, $auth /* AnalyticsLoginSrv */, $timeout, $filter) {
            'ngInject';

            var vm = this;

            this.socialAuth = function (provider) {
                vm.loading = {};
                var loadingProvider = vm.loading[provider] = {};
                loadingProvider.startLoader = true;
                $auth.authenticate(provider).then(function (response) {
                    return AuthService.userDataForAuthAndDataFb(response.data);
                }).then(function (results) {
                    var userDataAuth = results[0].auth;
                   // AnalyticsLoginSrv.save(results[0], provider, 'socialLogin');
                    UserProfileService.getProfile().then(function (userProfile) {
                        var location = ENV.redirectLogin;
                        var updateProfile = false;

                        if (!userProfile.email && userDataAuth.email) {
                            userProfile.email = userDataAuth.email;
                            updateProfile = true;
                        }
                        if (!userProfile.nickname && userDataAuth.nickname) {
                            userProfile.nickname = userDataAuth.nickname;
                            updateProfile = true;
                        }
                        if (!userProfile.provider && userDataAuth.provider) {
                            userProfile.provider = userDataAuth.provider;
                            updateProfile = true;
                        }
                        // adding timeout to make sure AnalyticsLoginSrv.save
                        // works before redirect
                        AuthService.registerFirstLogin().then(function () {
                            loadingProvider.fillLoader = true;
                            $timeout(function () {
                                loadingProvider.startLoader = loadingProvider.fillLoader = false;
                                if (updateProfile) {
                                    location = ENV.redirectSignup;
                                    UserProfileService.setProfile(userProfile).then(function () {
                                        $window.location.replace(location);
                                    });
                                } else {
                                    $window.location.replace(location);
                                }
                            });
                        });
                    });
                }).catch(function (error) {
                    var title = $filter('translate')('OATH_SOCIAL.ERROR_TITLE', { provider: provider });
                    var content = $filter('translate')('OATH_SOCIAL.ERROR_CONTENT', { provider: provider });
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
                providers: '='
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

        this.$get = ["$q", "$http", "$log", "$window", function ($q, $http, $log, $window) {
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

            function _writeUserProfile(formData, appContext){
                var appRef = _getAppRef(appContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid);
                var profile = {
                    email: formData.email,
                    nickname: formData.nickname
                };
                return userProfileRef.set(profile).catch(function(err){
                    $log.error(err);
                });
            }

            function _redirectToPage() {
                $window.location.href = "//" + $window.location.host + '/sat-web-app';
            }

            LoginAppSrv.createAuthWithCustomToken = function (refDB, token) {
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

            // LoginAppSrv.userDataForAuthAndDataFb = function (data)  {
            //     var proms = [
            //         this.createAuthWithCustomToken(refAuthDB, data.authToken),
            //         this.createAuthWithCustomToken(refDataDB, data.dataToken)
            //     ];
            //     return $q.all(proms);
            // };

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
                                _redirectToPage();
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
                            return _writeUserProfile(formData, appContext, userContext).then(function(){
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
  $templateCache.put("components/loginApp/templates/loginApp.directive.html",
    "<div class=\"login-app\" ng-class=\"{student: d.userContext === d.userContextObj.STUDENT, educator: d.userContext === d.userContextObj.TEACHER}\">\n" +
    "    <header>\n" +
    "        <div class=\"logo\"></div>\n" +
    "\n" +
    "        <div class=\"app-select\" ng-cloak>\n" +
    "            <md-menu md-offset=\"0 60\" md-no-ink>\n" +
    "                <md-button aria-label=\"Open App Select Menu\" class=\"md-icon-button\" ng-click=\"openMenu($mdOpenMenu, $event)\">\n" +
    "                    <div class=\"app-img-holder\"></div>\n" +
    "                    <md-icon class=\"material-icons expand-menu\">expand_more</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content width=\"4\">\n" +
    "                    <md-menu-item ng-repeat=\"app in d.availableApps track by app.id\" ng-click=\"selectApp(app)\">\n" +
    "                        <md-button>{{app.name}}</md-button>\n" +
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
    "                <div class=\"go-to-signup\" ng-click=\"changeCurrentForm('signup')\">Sign Up</div>\n" +
    "            </div>\n" +
    "            <div class=\"signup-container\" ng-switch-when=\"signup\">\n" +
    "                <signup-form app-context=\"d.appContext\"\n" +
    "                             user-context=\"d.userContext\">\n" +
    "                </signup-form>\n" +
    "                <div class=\"go-to-login\" ng-click=\"changeCurrentForm('login')\">Log In</div>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "        <!--<div ng-show=\"currentForm === 'login'\" class=\"go-to-signup ng-hide\" ng-click=\"currentForm = 'signup'\">Sign Up</div>-->\n" +
    "        <!--<div ng-show=\"currentForm === 'signup'\" class=\"go-to-login ng-hide\" ng-click=\"currentForm = 'login'\">Log In</div>-->\n" +
    "    </div>\n" +
    "    <footer>\n" +
    "        <ng-switch on=\"currentUserContext\">\n" +
    "            <div ng-switch-when=\"teacher\">\n" +
    "                <h2>Check out our App for Students</h2>\n" +
    "                <a href=\"\" ng-click=\"changeUserContext(d.userContextObj.STUDENT)\">Check out Zinkerz tools for teachers</a>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"student\">\n" +
    "                <h2>Are you an educator?</h2>\n" +
    "                <a href=\"\" ng-click=\"changeUserContext(d.userContextObj.TEACHER)\">Check out Zinkerz tools for teachers</a>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "    </footer>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/loginForm.directive.html",
    "<form novalidate class=\"form-container\" translate-namespace=\"LOGIN_FORM\" ng-submit=\"loginSubmit()\">\n" +
    "    <div class=\"title\"\n" +
    "         translate=\".LOGIN\">\n" +
    "    </div>\n" +
    "    <!--<div class=\"social-auth-container\">-->\n" +
    "        <!--<div class=\"social-auth\">-->\n" +
    "            <!--<oath-login-drv providers=\"{facebook:true,google:true}\"></oath-login-drv>-->\n" +
    "        <!--</div>-->\n" +
    "    <!--</div>-->\n" +
    "    <!--<div class=\"divider\">-->\n" +
    "        <!--<div translate=\".OR\" class=\"text\"></div>-->\n" +
    "    <!--</div>-->\n" +
    "    <div class=\"inputs-container\">\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                   name=\"email\"\n" +
    "                   ng-model=\"d.loginFormData.email\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "            <input type=\"password\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                   name=\"password\"\n" +
    "                   ng-model=\"d.loginFormData.password\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"submit-btn-wrapper\">\n" +
    "        <button type=\"submit\" translate=\".LOGIN_IN\"></button>\n" +
    "    </div>\n" +
    "    <!--<div class=\"forgot-pwd-wrapper\">-->\n" +
    "        <!--<span translate=\".FORGOT_PWD\"></span>-->\n" +
    "    <!--</div>-->\n" +
    "</form>\n" +
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
    "<form novalidate class=\"form-container\"\n" +
    "      translate-namespace=\"SIGNUP_FORM\"\n" +
    "      ng-submit=\"signupSubmit()\">\n" +
    "    <div class=\"title\"\n" +
    "         translate=\".SIGNUP\">\n" +
    "    </div>\n" +
    "    <!--<div class=\"social-auth-container\">-->\n" +
    "        <!--<div class=\"social-auth\">-->\n" +
    "            <!--<oath-login-drv providers=\"{facebook:true,google:true}\"></oath-login-drv>-->\n" +
    "        <!--</div>-->\n" +
    "    <!--</div>-->\n" +
    "    <!--<div class=\"divider\">-->\n" +
    "        <!--<div translate=\".OR\" class=\"text\"></div>-->\n" +
    "    <!--</div>-->\n" +
    "    <div class=\"inputs-container\">\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'SIGNUP_FORM.NAME' | translate}}\"\n" +
    "                   name=\"nickname\"\n" +
    "                   ng-model=\"d.signupFormData.nickname\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'SIGNUP_FORM.EMAIL' | translate}}\"\n" +
    "                   name=\"email\"\n" +
    "                   ng-model=\"d.signupFormData.email\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "            <input type=\"password\"\n" +
    "                   placeholder=\"{{'SIGNUP_FORM.PASSWORD' | translate}}\"\n" +
    "                   name=\"password\"\n" +
    "                   ng-model=\"d.signupFormData.password\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"submit-btn-wrapper\">\n" +
    "        <button type=\"submit\" translate=\".SIGNUP\"></button>\n" +
    "    </div>\n" +
    "    <!--<div class=\"forgot-pwd-wrapper\">-->\n" +
    "    <!--<span translate=\".FORGOT_PWD\"></span>-->\n" +
    "    <!--</div>-->\n" +
    "</form>\n" +
    "");
}]);
