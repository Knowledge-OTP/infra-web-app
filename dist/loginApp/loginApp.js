(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'ngMaterial',
        'satellizer',
        'znk.infra.general',
        'znk.infra.autofocus'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg',
                'facebook-icon': 'components/loginApp/svg/facebook-icon.svg',
                'google-icon': 'components/loginApp/svg/google-icon.svg',
                'login-username-icon': 'components/loginApp/svg/login-username-icon.svg',
                'dropdown-arrow': 'components/loginApp/svg/dropdown-arrow.svg',
                'v-icon': 'components/loginApp/svg/v-icon.svg',
                'loginApp-arrow-icon': 'components/loginApp/svg/arrow-icon.svg',
                'loginApp-close-icon': 'components/loginApp/svg/close-icon.svg',
                'loginApp-correct-icon': 'components/loginApp/svg/correct-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ])
        .run(["$location", "InvitationKeyService", function ($location, InvitationKeyService) {
            var search = $location.search();
            var iid = search.iid;
            if (angular.isDefined(iid) && iid !== null) {
                InvitationKeyService.saveInvitationKey(iid);
            }
            //     var authObj = AuthService.getAuth();
            //     if (authObj) {
            //         InvitationStorageSrv.getInvitationObject(iid).then(function (res) {
            //             var invitation = res;
            //             if (angular.equals(invitation, {})) {
            //                 $log.error('Invitation object is empty');
            //                 return;
            //             }
            //             var receiverEmail = invitation.receiverEmail;
            //             if (receiverEmail === authObj.auth.token.email.toLowerCase()) {
            //                 redirectToApp();
            //             } else {
            //                 logout();
            //             }
            //         });
            //     }
            // }
            // function redirectToApp() {
            //     InvitationKeyService.navigateWithInvitationKey();
            // }
            //
            // function logout() {
            //     AuthService.logout();
            // }
        }]);
})(window, angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('resetPasswordForm',
        ["LoginAppSrv", "$timeout", function (LoginAppSrv, $timeout) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/resetPasswordForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<',
                    backToLogin: '&'
                },
                link: function (scope) {
                    scope.resetPasswordSucceeded = false;
                    scope.showSpinner = false;
                    scope.passwordSubmit = function (changePasswordForm) {
                        changePasswordForm.email.$setValidity("noSuchEmail", true);
                        scope.showSpinner = true;
                        if (changePasswordForm.$invalid) {
                            scope.showSpinner = false;
                            return;
                        }
                        LoginAppSrv.resetPassword(scope.appContext.id, changePasswordForm.email.$viewValue, scope.userContext).then(function (resetPasswordSate) {
                            $timeout(function () {
                                if (angular.isUndefined(resetPasswordSate)) {
                                    scope.showSpinner = false;
                                    scope.resetPasswordSucceeded = true;
                                } else {
                                    if (resetPasswordSate.code === 'INVALID_USER') {
                                        scope.showSpinner = false;
                                        scope.resetPasswordSucceeded = false;
                                        changePasswordForm.email.$setValidity("noSuchEmail", false);
                                    }
                                }
                            });
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

    angular.module('znk.infra-web-app.loginApp').directive('loginApp',
        ["$translatePartialLoader", "LoginAppSrv", "$location", "$timeout", "$document", "InvitationKeyService", function ($translatePartialLoader, LoginAppSrv, $location, $timeout, $document, InvitationKeyService) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginApp.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginApp');

                    scope.d = {
                        availableApps: LoginAppSrv.APPS,
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        userContext: LoginAppSrv.USER_CONTEXT.STUDENT,
                        changePassword: false
                    };

                    var socialProvidersArr = ['facebook', 'google'];
                    var invitationKey = InvitationKeyService.getInvitationKey();

                    LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                    scope.currentUserContext = 'student';
                    scope.currentForm = 'signup';


                    scope.selectApp = function (app) {
                        scope.d.appContext = app;
                        LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);
                    };

                    scope.changeCurrentForm = function (currentForm) {
                        scope.currentForm = currentForm;
                    };

                    scope.changeUserContext = function (context) {
                        scope.d.userContext = context;
                        if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.STUDENT) {
                            scope.currentUserContext = 'student';
                        } else if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.TEACHER) {
                            scope.currentUserContext = 'teacher';
                        }
                    };

                    // App select menu
                    var originatorEv;
                    scope.openMenu = function ($mdOpenMenu, ev) {
                        originatorEv = ev;
                        $mdOpenMenu(ev);
                    };

                    scope.changePasswordClick = function () {
                        scope.changeCurrentForm('changePassword');
                        scope.d.changePassword = !scope.d.changePassword;
                    };

                    var search = $location.search();
                    if (!!((!angular.equals(search, {}) || invitationKey) && (search.app || search.state || search.userType || invitationKey))) {
                        if (search.app) {
                            angular.forEach(LoginAppSrv.APPS, function (app, index) {
                                if (index.toLowerCase() === search.app.toLowerCase()) {
                                    scope.selectApp(app);
                                }
                            });
                        }

                        if (invitationKey && invitationKey !== null) {
                            scope.d.invitationId = invitationKey;
                        }

                        if (search.userType) {
                            if (search.userType === 'educator') {
                                scope.changeUserContext(scope.d.userContextObj.TEACHER);
                            } else {
                                scope.changeUserContext(scope.d.userContextObj.STUDENT);
                            }
                        }

                        if (search.state) {
                            scope.changeCurrentForm(search.state);
                        }

                    }

                    //catching $mdMenuOpen event emitted from angular-material.js
                    scope.$on('$mdMenuOpen', function () {
                        $timeout(function () {
                            //getting menu content container by tag id from html
                            var menuContentContainer = angular.element($document[0].getElementById('app-select-menu'));
                            // Using parent() method to get parent warper with .md-open-menu-container class and adding custom class.
                            menuContentContainer.parent().addClass('app-select-menu-open');
                        });
                    });
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

    angular.module('znk.infra-web-app.loginApp').directive('loginForm',
        ["LoginAppSrv", "$timeout", "$translate", "$log", function (LoginAppSrv, $timeout, $translate, $log) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<',
                    changePasswordClick: '&'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        changePassword: false
                    };

                    scope.loginSubmit = function(loginForm) {
                        if (loginForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData)
                            .then(function(authData){
                                $log.debug("Authenticated successfully with payload: ", authData);
                            })
                            .catch(function(err){
                                $log.error(err);
                                if (err) {
                                    var errorCodeStrings;
                                    var errorCodesPath = 'LOGIN_FORM.ERROR_CODES.';
                                    var errorCodesStringKeysArr = [
                                        errorCodesPath + 'INVALID_EMAIL',
                                        errorCodesPath + 'INVALID_PASSWORD',
                                        errorCodesPath + 'INVALID_USER',
                                        errorCodesPath + 'DEFAULT_ERROR'
                                    ];
                                    $translate(errorCodesStringKeysArr)
                                        .then(function(tranlations){
                                            var loginError;
                                            errorCodeStrings = tranlations;
                                            switch (err.code) {
                                                case "INVALID_EMAIL":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_EMAIL'];
                                                    break;
                                                case "INVALID_PASSWORD":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_PASSWORD'];
                                                    break;
                                                case "INVALID_USER":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_USER'];
                                                    break;
                                                default:
                                                    loginError = errorCodeStrings[errorCodesPath + 'DEFAULT_ERROR'] + err.code;
                                            }
                                            $timeout(function(){
                                                hideSpinner();
                                                scope.d.disableBtn = false;
                                                scope.d.loginError = loginError;
                                            });
                                        })
                                        .catch(function(err){
                                            $log.error('Cannot fetch translation! ', err);
                                        });
                                }
                            });
                    };

                    scope.replaceToChangePassword = function () {
                        scope.d.changePassword = !scope.d.changePassword;
                    };

                    function showSpinner() {
                        scope.d.showSpinner = true;
                    }

                    function hideSpinner() {
                        scope.d.showSpinner = false;
                    }
                }
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('promoCode',
        ["PromoCodeSrv", "PROMO_CODE_STATUS", function (PromoCodeSrv, PROMO_CODE_STATUS) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/promoCode.template.html',
                restrict: 'E',
                scope: {},
                link: function (scope) {
                    var ENTER_KEY_CODE = 13;

                    scope.d = {};
                    scope.d.promoCodeStatusConst = PROMO_CODE_STATUS;


                    scope.d.sendPromoCode = function (promoCode) {
                        if (promoCode) {
                            scope.d.showSpinner = true;
                            PromoCodeSrv.checkPromoCode(promoCode).then(function (promoCodeResult) {
                                scope.d.promoCodeStatus = promoCodeResult.status;
                                scope.d.promoCodeStatusText = promoCodeResult.text;
                                scope.d.showSpinner = false;
                                if (scope.d.promoCodeStatus === scope.d.promoCodeStatusConst.accepted) {
                                    PromoCodeSrv.promoCodeToUpdate(promoCode);
                                } else {
                                    PromoCodeSrv.promoCodeToUpdate(undefined);
                                }
                            });
                        }
                    };
                    scope.d.clearInput = function () {
                        _cleanPromoCodeStatus();
                        scope.d.promoCode = '';
                    };

                    scope.d.keyDownHandler = function ($event, promoCode) {
                        if ($event.keyCode !== ENTER_KEY_CODE) {
                            _cleanPromoCodeStatus();
                            return;
                        }
                        scope.d.sendPromoCode(promoCode);
                    };

                    var promoCodeToUpdate = PromoCodeSrv.getPromoCodeToUpdate();  // restore promo code (if was entered) between login view and sign up view.
                    if (promoCodeToUpdate) {
                        scope.d.promoCode = promoCodeToUpdate;
                        scope.d.sendPromoCode(promoCodeToUpdate);
                    }

                    function _cleanPromoCodeStatus() {
                        scope.d.promoCodeStatus = -1;
                        scope.d.promoCodeStatusText = '';
                    }
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
        ["LoginAppSrv", "$log", "$timeout", function (LoginAppSrv, $log, $timeout) {
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
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        termsOfUseHref: '//www.zinkerz.com/terms-of-use/',
                        privacyPolicyHref: '//www.zinkerz.com/privacy-policy/'
                    };

                    scope.signupSubmit = function (signupForm) {
                        signupForm.email.$setValidity("emailTaken", true);
                        if (signupForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData)
                            .then(function () {
                                hideSpinner();
                                scope.d.disableBtn = false;
                            })
                            .catch(function (err) {
                                $timeout(function () {
                                    if (err.code === 'EMAIL_TAKEN') {
                                        console.log(signupForm.email);
                                        signupForm.email.$setValidity("emailTaken", false);
                                    }
                                });
                                hideSpinner();
                                scope.d.disableBtn = false;
                                $log.error(err);
                            });
                    };

                    function showSpinner() {
                        scope.d.showSpinner = true;
                    }

                    function hideSpinner() {
                        scope.d.showSpinner = false;
                    }
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
                loadingProvider.showSpinner = true;
                $auth.authenticate(provider).then(function (response) {
                    return LoginAppSrv.userDataForAuthAndDataFb(response.data, vm.appContext.id, vm.userContext);
                }).then(function (results) {
                    var userDataAuth = results[0].auth;

                    LoginAppSrv.getUserProfile(vm.appContext.id, vm.userContext).then(function (userProfile) {
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


                        loadingProvider.showSpinner = false;

                        if (updateProfile) {
                            LoginAppSrv.writeUserProfile(userProfile, vm.appContext.id, vm.userContext, true).then(function () {
                                LoginAppSrv.redirectToPage(vm.appContext.id, vm.userContext);
                            });
                        } else {
                            LoginAppSrv.redirectToPage(vm.appContext.id, vm.userContext);
                        }
                    });
                }).catch(function (error) {
                    $log.error('OathLoginDrvController socialAuth', error);
                    loadingProvider.showSpinner = false;
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
            templateUrl: 'components/loginApp/oathLogin/oathLogin.template.html',
            controller: 'OathLoginDrvController',
            bindToController: true,
            controllerAs: 'vm'
        };
    });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('PromoCodeTypeEnum',['EnumSrv',
        function(EnumSrv) {

            var PromoCodeTypeEnum = new EnumSrv.BaseEnum([
                ['FREE_LICENSE', 1, 'free license'],
                ['ZINKERZ_EDUCATOR', 2, 'zinkerz educator'],
            ]);

            return PromoCodeTypeEnum;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('InvitationKeyService',
        function () {
            'ngInject';
            var invitationKey;

            this.saveInvitationKey = function (_invitationKey) {
                invitationKey = _invitationKey;
            };

            this.getInvitationKey = function () {
                return invitationKey;
            };

          //   this.navigateWithInvitationKey = function () {
          //       // var appUrl = ENV.redirectSignup;
          //       var inviteId = this.getInvitationKey();
          //       if (angular.isDefined(inviteId)) {
          //           appUrl += '#?iid=' + inviteId;
          //       }
          //       $window.location.replace(appUrl);
          // };
        }
    );
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
        redirectFacebook: '//www.zinkerz.com/',
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
        redirectFacebook: '//www.zinkerz.com/',
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
        redirectFacebook: '//www.zinkerz.com/',
        backendEndpoint: 'https://znk-web-backend-prod.azurewebsites.net/',
        dataAuthSecret: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM',
        firebaseAppScopeName: 'toefl_app',
        studentAppName: 'toefl_app',
        dashboardAppName: 'toefl_dashboard'
    };

    angular.module('znk.infra-web-app.loginApp').provider('LoginAppSrv', function () {
        var env = 'dev';
        this.setEnv = function (newEnv) {
            env = newEnv;
        };

        this.$get = ["$q", "$http", "$log", "$window", "SatellizerConfig", "InvitationKeyService", "PromoCodeSrv", function ($q, $http, $log, $window, SatellizerConfig, InvitationKeyService, PromoCodeSrv) {
            'ngInject';

            var LoginAppSrv = {};

            function _getAppEnvConfig(appContext) {
                return ALL_ENV_CONFIG[env][appContext];
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
                var invitationKey = InvitationKeyService.getInvitationKey();
                var invitationPostFix = '';
                if (angular.isDefined(invitationKey) && invitationKey !== null) {
                    invitationPostFix = '#?iid=' + invitationKey;
                }
                var promoCode = PromoCodeSrv.getPromoCodeToUpdate();
                var promoCodePostFix = '';
                if (angular.isDefined(promoCode) && promoCode !== null) {
                    promoCodePostFix = '#?pcid=' + promoCode;
                }
                $window.location.href = "//" + $window.location.host + '/' + appName + '/web-app' + invitationPostFix + promoCodePostFix;
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
        }];
    });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').constant('PROMO_CODE_STATUS', {
        accepted: 0,
        invalid: 1
    });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('PromoCodeSrv',
        ["PROMO_CODE_STATUS", "$translate", "$q", "$http", "ENV", "PromoCodeTypeEnum", function (PROMO_CODE_STATUS, $translate, $q, $http, ENV, PromoCodeTypeEnum) {
            'ngInject';

            var deferred;
            var promoCodeStatus;
            var INVALID = 'PROMO_CODE.INVALID_CODE';
            var promoCodeCheckUrl = ENV.backendEndpoint + '/promoCode/check';
            var promoCodeToUpdate;

            var promoCodeStatusText = {};
            promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
            promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
            promoCodeStatusText[INVALID] = INVALID;

            this.checkPromoCode = function (promoCode) {
                deferred = $q.defer();
                var dataToSend = {};
                dataToSend.promoCode = promoCode;
                dataToSend.appName = ENV.firebaseAppScopeName;

                $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                return deferred.promise;
            };

            this.promoCodeToUpdate = function (promoCode) {
                promoCodeToUpdate = promoCode;
            };

            this.getPromoCodeToUpdate = function () {
                return promoCodeToUpdate;
            };

            function _validPromoCode(response) {
                promoCodeStatus = {};
                var promoCodeType = response.data;
                if (response.data && promoCodeStatusText[promoCodeType]) {
                    promoCodeStatus.text = _getPromoCodeStatusText(response.data);
                    promoCodeStatus.status = PROMO_CODE_STATUS.accepted;
                } else {
                    promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                    promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                }
                deferred.resolve(promoCodeStatus);
            }

            function _invalidPromoCode() {
                promoCodeStatus = {};
                promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                deferred.resolve(promoCodeStatus);
            }

            function _getPromoCodeStatusText(translationKey) {
                return $translate.instant(promoCodeStatusText[translationKey]);
            }
        }]
    );
})(angular);

angular.module('znk.infra-web-app.loginApp').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginApp/oathLogin/oathLogin.template.html",
    "<div class=\"btn-wrap\" translate-namespace=\"OATH_SOCIAL\">\n" +
    "    <button class=\"social-btn facebook-btn\"\n" +
    "            ng-click=\"vm.socialAuth('facebook')\"\n" +
    "            ng-if=\"vm.providers.facebook\">\n" +
    "        <svg-icon name=\"facebook-icon\"></svg-icon>\n" +
    "        <span class=\"loader ng-hide\" ng-show=\"vm.loading.facebook.showSpinner\"></span>\n" +
    "        <span translate=\".CONNECT_WITH_FB\"></span>\n" +
    "    </button>\n" +
    "    <button class=\"social-btn gplus-btn\"\n" +
    "            ng-click=\"vm.socialAuth('google')\"\n" +
    "            ng-if=\"vm.providers.google\">\n" +
    "        <svg-icon name=\"google-icon\"></svg-icon>\n" +
    "        <span class=\"loader ng-hide\" ng-show=\"vm.loading.google.showSpinner\"></span>\n" +
    "        <span translate=\".CONNECT_WITH_GOOGLE\"></span>\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/svg/arrow-icon.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    version=\"1.1\" id=\"Capa_1\" x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"0 0 611.987 611.987\"\n" +
    "    xml:space=\"preserve\">\n" +
    "    <style>\n" +
    "        svg{\n" +
    "        width:30px;\n" +
    "        height:20px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g id=\"arrow-R\">\n" +
    "		<g>\n" +
    "			<path d=\"M604.652,287.018c-0.532-0.532-1.225-0.692-1.757-1.171L417.717,100.668c-10.329-10.329-27.074-10.329-37.377,0     c-10.328,10.329-10.328,27.074,0,37.376l141.334,141.333H26.622C11.926,279.377,0,291.304,0,306     c0,14.694,11.926,26.621,26.622,26.621h495.052L380.341,473.954c-10.329,10.329-10.329,27.074,0,37.376     c10.329,10.303,27.073,10.329,37.376,0l185.232-185.258c0.532-0.453,1.197-0.612,1.703-1.092c0.825-0.825,0.825-1.97,1.518-2.875     c2.263-2.796,3.86-5.856,4.818-9.158c0.346-1.277,0.586-2.396,0.719-3.7C612.799,301.34,610.749,293.087,604.652,287.018z\" fill=\"#FFFFFF\"/>\n" +
    "		</g>\n" +
    "	</g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/close-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/correct-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     class=\"correct-icon-svg\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 188.5 129\"\n" +
    "     style=\"enable-background:new 0 0 188.5 129;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.correct-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "        stroke: #231F20;\n" +
    "        stroke-width: 15;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"7.5\" y1=\"62\" x2=\"67\" y2=\"121.5\"/>\n" +
    "	<line class=\"st0\" x1=\"67\" y1=\"121.5\" x2=\"181\" y2=\"7.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
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
  $templateCache.put("components/loginApp/svg/login-username-icon.svg",
    "<svg\n" +
    "    class=\"login-username-icon-svg\"\n" +
    "    x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"0 0 155.5 155.1\"\n" +
    "    style=\"enable-background:new 0 0 155.5 155.1;\">\n" +
    "    <style>\n" +
    "        .login-username-icon-svg{\n" +
    "        width: 20px;\n" +
    "        stroke: #CACACA;\n" +
    "        fill: none;\n" +
    "        stroke-width: 10;\n" +
    "        stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"st0\" cx=\"77.7\" cy=\"40.3\" r=\"37.8\"/>\n" +
    "        <path class=\"st0\" d=\"M77.7,152.6h68.5c4,0,7.2-3.5,6.7-7.5c-0.7-6.2-2.3-14.2-3.7-18.2c-8.5-23.7-28.7-30.4-36.3-32.1\n" +
    "		c-1.8-0.4-3.6,0-5.1,0.9c-15.9,10.1-44.2,10.1-60,0c-1.5-1-3.4-1.3-5.1-0.9c-7.6,1.7-27.8,8.3-36.3,32.1c-1.5,4.1-3,12-3.7,18.2\n" +
    "		c-0.5,4,2.7,7.5,6.7,7.5H77.7z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/v-icon.svg",
    "<svg class=\"v-icon-wrapper\" x=\"0px\" y=\"0px\" viewBox=\"0 0 334.5 228.7\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .v-icon-wrapper .st0{\n" +
    "            fill:#ffffff;\n" +
    "            stroke:#ffffff;\n" +
    "            stroke-width:26;\n" +
    "            stroke-linecap:round;\n" +
    "            stroke-linejoin:round;\n" +
    "            stroke-miterlimit:10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"13\" y1=\"109.9\" x2=\"118.8\" y2=\"215.7\"/>\n" +
    "	<line class=\"st0\" x1=\"118.8\" y1=\"215.7\" x2=\"321.5\" y2=\"13\"/>\n" +
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
    "        <div class=\"logo-wrapper\">\n" +
    "            <a class=\"logo\" href=\"https://www.zinkerz.com\"></a>\n" +
    "            <span ng-if=\"d.userContext===d.userContextObj.TEACHER\"\n" +
    "                  translate=\"LOGIN_APP.FOR_EDUCATORS\">\n" +
    "            </span>\n" +
    "        </div>\n" +
    "        <div class=\"app-select\" ng-cloak ng-class=\"{'no-dropdown': d.invitationId}\">\n" +
    "            <md-menu md-offset=\"-50 80\" md-no-ink ng-if=\"!d.invitationId\">\n" +
    "                <md-button aria-label=\"Open App Select Menu\"\n" +
    "                           class=\"md-icon-button\"\n" +
    "                           ng-click=\"openMenu($mdOpenMenu, $event)\">\n" +
    "                    <md-icon class=\"material-icons expand-menu\">expand_more</md-icon>\n" +
    "                    <div class=\"app-img-holder {{d.appContext.className}}\"></div>\n" +
    "                </md-button>\n" +
    "                <md-menu-content id=\"app-select-menu\">\n" +
    "                    <md-menu-item ng-repeat=\"app in d.availableApps track by app.id\"\n" +
    "                                  ng-click=\"selectApp(app)\">\n" +
    "                        <div class=\"app-img-holder {{app.className}}\"></div>\n" +
    "                    </md-menu-item>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "            <div class=\"app-img-holder {{d.appContext.className}}\" ng-if=\"d.invitationId\"></div>\n" +
    "        </div>\n" +
    "        <a ng-if=\"d.userContext===d.userContextObj.STUDENT && !d.invitationId && d.appContext.className !== 'toefl'\"\n" +
    "           class=\"for-educators app-color\"\n" +
    "           ng-click=\"changeUserContext(d.userContextObj.TEACHER)\"\n" +
    "           translate=\"LOGIN_APP.EDUCATORS_CLICK_HERE\">\n" +
    "        </a>\n" +
    "    </header>\n" +
    "    <div class=\"main\">\n" +
    "        <div ng-switch=\"d.userContext\" ng-if=\"!d.invitationId\">\n" +
    "            <img class=\"main-banner img-responsive\" ng-switch-when=\"1\"\n" +
    "                 src=\"assets/images/login-teacher-bg@2x.jpg\">\n" +
    "            <img class=\"main-banner img-responsive\" ng-switch-when=\"2\"\n" +
    "                 src=\"assets/images/login-student-bg@2x.jpg\">\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"d.invitationId\">\n" +
    "            <div ng-switch=\"d.userContext\">\n" +
    "                <img class=\"main-banner img-responsive\" ng-switch-when=\"1\"\n" +
    "                     src=\"assets/images/login-teacher-invitation-bg@2x.jpg\">\n" +
    "                <img class=\"main-banner img-responsive\" ng-switch-when=\"2\"\n" +
    "                     src=\"assets/images/login-student-invitation-bg@2x.jpg\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"main-inner\">\n" +
    "            <ng-switch on=\"currentForm\">\n" +
    "                <div class=\"login-container\" ng-switch-when=\"login\">\n" +
    "                    <login-form app-context=\"d.appContext\"\n" +
    "                                user-context=\"d.userContext\"\n" +
    "                                change-password-click=\"changePasswordClick()\">\n" +
    "                    </login-form>\n" +
    "                    <p class=\"go-to-signup\">\n" +
    "                        <span translate=\"LOGIN_FORM.STUDENT.DONT_HAVE_AN_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.STUDENT\"></span>\n" +
    "                        <span translate=\"LOGIN_FORM.EDUCATOR.DONT_HAVE_AN_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.TEACHER\"></span>\n" +
    "                        <a ng-click=\"changeCurrentForm('signup')\" translate=\"SIGNUP_FORM.SIGN_UP\"></a>\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "                <div class=\"signup-container\" ng-switch-when=\"signup\">\n" +
    "                    <signup-form app-context=\"d.appContext\"\n" +
    "                                 user-context=\"d.userContext\">\n" +
    "                    </signup-form>\n" +
    "                    <p class=\"go-to-login\">\n" +
    "                        <span translate=\"SIGNUP_FORM.STUDENT.ALREADY_HAVE_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.STUDENT\"></span>\n" +
    "                        <span translate=\"SIGNUP_FORM.EDUCATOR.ALREADY_HAVE_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.TEACHER\"></span>\n" +
    "                        <a ng-click=\"changeCurrentForm('login')\" translate=\"LOGIN_FORM.LOGIN_IN\"></a>\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"change-password-container\" ng-switch-when=\"changePassword\">\n" +
    "                    <reset-password-form app-context=\"d.appContext\" user-context=\"d.userContext\"\n" +
    "                                         back-to-login=\"changeCurrentForm('login')\">\n" +
    "\n" +
    "                    </reset-password-form>\n" +
    "                    <a class=\"back-to-login-btn\" ng-click=\"changeCurrentForm('login')\">\n" +
    "                        <svg-icon name=\"dropdown-arrow\" class=\"back-btn-icon\"></svg-icon>\n" +
    "                        <span class=\"back-btn-label\" translate=\"CHANGE_PASSOWRD_FORM.BACK_TO_LOGIN\"></span>\n" +
    "                    </a>\n" +
    "                </div>\n" +
    "            </ng-switch>\n" +
    "            <h2 class=\"banner-text\">\n" +
    "                <ng-switch on=\"currentUserContext\" ng-if=\"!d.invitationId\">\n" +
    "                    <div ng-switch-when=\"teacher\" class=\"switch-student-educator\">\n" +
    "                        <span translate=\"LOGIN_APP.SAT_EDUCATOR_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.SAT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.ACT_EDUCATOR_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.ACT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.TOEFL_EDUCATOR_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.TOEFL\"></span>\n" +
    "                    </div>\n" +
    "                    <div ng-switch-when=\"student\" class=\"switch-student-educator\">\n" +
    "                        <span translate=\"LOGIN_APP.SAT_STUDENT_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.SAT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.ACT_STUDENT_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.ACT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.TOEFL_STUDENT_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.TOEFL\"></span>\n" +
    "                    </div>\n" +
    "                </ng-switch>\n" +
    "                <div class=\"invitation-title\" ng-if=\"d.invitationId\">\n" +
    "                    <div class=\"first-row\" translate=\"LOGIN_APP.SIGNUP_OR_LOGIN\"></div>\n" +
    "                    <div class=\"second-row\" translate=\"LOGIN_APP.ACCEPT_INVITATION\"></div>\n" +
    "                </div>\n" +
    "            </h2>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <footer>\n" +
    "        <ng-switch on=\"currentUserContext\" ng-if=\"!d.invitationId && d.appContext.className !== 'toefl'\">\n" +
    "            <div ng-switch-when=\"teacher\" class=\"switch-student-educator\">\n" +
    "                <h2 translate=\"LOGIN_APP.CHECK_OUT_OUR_APP_FOR_STUDENTS\"></h2>\n" +
    "                <a href=\"\" class=\"app-color\" ng-click=\"changeUserContext(d.userContextObj.STUDENT)\"\n" +
    "                   translate=\"LOGIN_APP.SIGN_UP_FOR_ZINKERZ_TEST_PREP\"></a>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"student\" class=\"switch-student-educator\">\n" +
    "                <h2 translate=\"LOGIN_APP.ARE_YOU_AN_EDUCATOR\"></h2>\n" +
    "                <a href=\"\" class=\"app-color\" ng-click=\"changeUserContext(d.userContextObj.TEACHER)\"\n" +
    "                   translate=\"LOGIN_APP.CHECK_OUT_ZINKERZ_TOOLS_FOR_TEACHERS\"></a>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "    </footer>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/loginForm.directive.html",
    "<div class=\"form-container login\" translate-namespace=\"LOGIN_FORM\">\n" +
    "    <div class=\"title\" translate=\"LOGIN_FORM.STUDENT.LOGIN\" ng-if=\"userContext===d.userContextObj.STUDENT\"></div>\n" +
    "    <div class=\"title\" translate=\"LOGIN_FORM.EDUCATOR.LOGIN\" ng-if=\"userContext===d.userContextObj.TEACHER\"></div>\n" +
    "    <promo-code></promo-code>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth\">\n" +
    "            <oath-login-drv\n" +
    "                app-context=\"appContext\"\n" +
    "                user-context=\"userContext\"\n" +
    "                providers=\"{facebook:true,google:true}\">\n" +
    "            </oath-login-drv>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <form novalidate\n" +
    "          name=\"loginform\"\n" +
    "          ng-submit=\"loginSubmit(loginform)\">\n" +
    "        <div class=\"inputs-container\">\n" +
    "            <div class=\"input-wrapper\"\n" +
    "                 ng-class=\"loginform.email.$invalid && loginform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"email\"\n" +
    "                       placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                       name=\"email\"\n" +
    "                       ng-model=\"d.loginFormData.email\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"loginform.$submitted && loginform.email.$invalid && !loginform.email.$dirty\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"loginform.email.$error.required\"\n" +
    "                              translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\"\n" +
    "                 ng-class=\"loginform.password.$invalid && loginform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "                <input type=\"password\"\n" +
    "                       placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                       name=\"password\"\n" +
    "                       autocomplete=\"off\"\n" +
    "                       ng-minlength=\"6\"\n" +
    "                       ng-maxlength=\"25\"\n" +
    "                       ng-model=\"d.loginFormData.password\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"loginform.$submitted && loginform.password.$invalid && !loginform.password.$dirty\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"loginform.password.$error.required\"\n" +
    "                              translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"submit-btn-wrapper\">\n" +
    "            <button type=\"submit\"\n" +
    "                    ng-disabled=\"d.disableBtn\"\n" +
    "                    class=\"app-bg\"\n" +
    "                    autofocus>\n" +
    "                <span translate=\".LOGIN_IN\"></span>\n" +
    "                <span class=\"loader ng-hide\" ng-show=\"d.showSpinner\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <div class=\"forgot-pwd-wrapper\">\n" +
    "            <span class=\"app-color\" translate=\".FORGOT_PWD\" ng-click=\"changePasswordClick()\"></span>\n" +
    "        </div>\n" +
    "        <p class=\"general-error\">{{d.loginError}}</p>\n" +
    "    </form>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
  $templateCache.put("components/loginApp/templates/promoCode.template.html",
    "<div class=\"promo-code-wrapper\" translate-namespace=\"PROMO_CODE\">\n" +
    "    <div class=\"promo-code-title\" translate=\".GOT_A_PROMO_CODE\" ng-click=\"d.showPromoCodeOverlay = !d.showPromoCodeOverlay\"></div>\n" +
    "\n" +
    "    <div class=\"promo-code-overlay\" ng-if=\"d.showPromoCodeOverlay\">\n" +
    "\n" +
    "        <div class=\"promo-code-input-wrapper\">\n" +
    "            <div class=\"input-wrapper\"\n" +
    "                 ng-class=\"{\n" +
    "             'promo-code-accepted': d.promoCodeStatus === d.promoCodeStatusConst.accepted,\n" +
    "             'promo-code-invalid': d.promoCodeStatus === d.promoCodeStatusConst.invalid\n" +
    "             }\">\n" +
    "                <md-progress-circular ng-if=\"d.showSpinner\"\n" +
    "                                      class=\"promo-code-spinner\"\n" +
    "                                      md-mode=\"indeterminate\"\n" +
    "                                      md-diameter=\"25\">\n" +
    "                </md-progress-circular>\n" +
    "                <input\n" +
    "                    type=\"text\"\n" +
    "                    ng-model=\"d.promoCode\"\n" +
    "                    ng-keydown=\"d.keyDownHandler($event, d.promoCode)\"\n" +
    "                    ng-autofocus =\"true\"\n" +
    "                    placeholder=\"{{'PROMO_CODE.ENTER_YOUR_CODE' | translate}}\">\n" +
    "                <div class=\"icon-wrapper\" >\n" +
    "                    <svg-icon class=\"arrow-icon\" name=\"loginApp-arrow-icon\" ng-click=\"d.sendPromoCode(d.promoCode)\"></svg-icon>\n" +
    "                    <svg-icon class=\"close-icon\" name=\"loginApp-close-icon\" ng-click=\"d.clearInput()\"></svg-icon>\n" +
    "                    <svg-icon class=\"correct-icon\" name=\"loginApp-correct-icon\"  ng-click=\"d.showPromoCodeOverlay = !d.showPromoCodeOverlay\"></svg-icon>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"promo-code-status-text\">\n" +
    "                    {{d.promoCodeStatusText}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/resetPasswordForm.directive.html",
    "<div class=\"form-container\" translate-namespace=\"CHANGE_PASSOWRD_FORM\">\n" +
    "    <ng-switch on=\"resetPasswordSucceeded\">\n" +
    "        <form novalidate\n" +
    "              name=\"changePasswordForm\"\n" +
    "              ng-submit=\"passwordSubmit(changePasswordForm)\"\n" +
    "              ng-switch-when=\"false\">\n" +
    "            <div class=\"inputs-container\">\n" +
    "                <div class=\"title\" translate=\".RESET_PASSWORD\"></div>\n" +
    "                <div class=\"input-wrapper\"\n" +
    "                     ng-class=\"changePasswordForm.email.$invalid && changePasswordForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                    <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                    <input type=\"email\"\n" +
    "                           placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                           name=\"email\"\n" +
    "                           ng-model=\"d.changePasswordForm.email\"\n" +
    "                           required>\n" +
    "                    <span\n" +
    "                        ng-if=\"(changePasswordForm.$submitted && changePasswordForm.email.$invalid && !changePasswordForm.email.$dirty) || (changePasswordForm.email.$error && changePasswordForm.$submitted)\"\n" +
    "                        role=\"alert\">\n" +
    "            <span class=\"validationBox\">\n" +
    "                <span ng-show=\"changePasswordForm.email.$error.required\"\n" +
    "                      translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                <span class=\"no-email-massage\" ng-show=\"changePasswordForm.email.$error.noSuchEmail\"\n" +
    "                      translate=\".NO_SUCH_EMAIL\"></span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"submit-btn-wrapper\">\n" +
    "                <button type=\"submit\"\n" +
    "                        ng-disabled=\"d.disableBtn\"\n" +
    "                        class=\"app-bg\"\n" +
    "                        autofocus>\n" +
    "                    <span translate=\".SEND\"></span>\n" +
    "                    <span class=\"loader ng-hide\" ng-show=\"showSpinner\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div ng-switch-when=\"true\" class=\"success-massage\">\n" +
    "            <div class=\"title\" translate=\".RESET_PASSWORD\"></div>\n" +
    "                <svg-icon name=\"v-icon\"></svg-icon>\n" +
    "            <div class=\"massage-text\" translate=\".NEW_PASSWORD_SENT\"></div>\n" +
    "            <div class=\"submit-btn-wrapper\">\n" +
    "                <button ng-disabled=\"d.disableBtn\"\n" +
    "                        class=\"app-bg\"\n" +
    "                        ng-click=\"backToLogin()\"\n" +
    "                        autofocus>\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/signupForm.directive.html",
    "<div class=\"form-container signup\" translate-namespace=\"SIGNUP_FORM\">\n" +
    "    <div class=\"title\" translate=\".STUDENT.CREATE_ACCOUNT\" ng-if=\"userContext===d.userContextObj.STUDENT\"></div>\n" +
    "    <div class=\"title\" translate=\".EDUCATOR.CREATE_ACCOUNT\" ng-if=\"userContext===d.userContextObj.TEACHER\"></div>\n" +
    "    <promo-code></promo-code>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth\">\n" +
    "            <oath-login-drv\n" +
    "                app-context=\"appContext\"\n" +
    "                user-context=\"userContext\"\n" +
    "                providers=\"{facebook:true,google:true}\">\n" +
    "            </oath-login-drv>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <form novalidate\n" +
    "          name=\"signupForm\"\n" +
    "          ng-submit=\"signupSubmit(signupForm)\">\n" +
    "        <div class=\"inputs-container\">\n" +
    "            <div class=\"input-wrapper\" ng-class=\"signupForm.nickname.$invalid && signupForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"login-username-icon\"></svg-icon>\n" +
    "                <input type=\"text\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.NAME' | translate}}\"\n" +
    "                       name=\"nickname\"\n" +
    "                       ng-model=\"d.signupFormData.nickname\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"signupForm.$submitted && signupForm.nickname.$invalid && !signupForm.nickname.$dirty\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"signupForm.nickname.$error.required\" translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\" ng-class=\"signupForm.email.$invalid && signupForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"email\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.EMAIL' | translate}}\"\n" +
    "                       name=\"email\"\n" +
    "                       ng-model=\"d.signupFormData.email\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"(signupForm.$submitted && signupForm.email.$invalid && !signupForm.email.$dirty) ||\n" +
    "                (signupForm.$submitted && signupForm.email.$error)\" role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"signupForm.email.$error.required\" translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                        <span class=\"email-exist-massage\" ng-show=\"signupForm.email.$error.emailTaken\" translate=\"LOGIN_APP.FORM_VALIDATION.EMAIL_TAKEN\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\" ng-class=\"signupForm.password.$invalid && signupForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "                <input type=\"password\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.PASSWORD' | translate}}\"\n" +
    "                       name=\"password\"\n" +
    "                       ng-model=\"d.signupFormData.password\"\n" +
    "                       ng-minlength=\"6\"\n" +
    "                       ng-maxlength=\"25\"\n" +
    "                       autocomplete=\"off\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"signupForm.$submitted && signupForm.password.$invalid\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"signupForm.password.$error.minlength\" translate=\"LOGIN_APP.FORM_VALIDATION.PASSWORD_TOO_SHORT\"></span>\n" +
    "                        <span ng-show=\"signupForm.password.$error.maxlength\" translate=\"LOGIN_APP.FORM_VALIDATION.PASSWORD_TOO_LONG\"></span>\n" +
    "                        <span ng-show=\"signupForm.password.$error.required\" translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"submit-btn-wrapper\">\n" +
    "            <button type=\"submit\"\n" +
    "                    ng-disabled=\"d.disableBtn\"\n" +
    "                    class=\"app-bg\"\n" +
    "                    autofocus>\n" +
    "                <span translate=\".SIGN_UP\"></span>\n" +
    "                <div class=\"loader ng-hide\" ng-show=\"d.showSpinner\"></div>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <p class=\"signup-disclaimer\"\n" +
    "           translate-values=\"{termsOfUseHref: d.termsOfUseHref, privacyPolicyHref: d.privacyPolicyHref}\"\n" +
    "           translate=\".DISCLAIMER\"></p>\n" +
    "\n" +
    "        <p class=\"general-error\">{{d.signupError}}</p>\n" +
    "    </form>\n" +
    "</div>\n" +
    "");
}]);
