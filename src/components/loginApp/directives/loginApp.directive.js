/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp',
        function (LoginAppSrv, $location, $timeout, $document, InvitationKeyService, ENV) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginApp.directive.html',
                restrict: 'E',
                link: function (scope) {

                    var isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';
                    var socialProvidersArr = ['facebook', 'google', 'live'];
                    var invitationKey = InvitationKeyService.getInvitationKey();

                    scope.d = {
                        availableApps: LoginAppSrv.APPS,
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        userContext: isTeacherApp ? LoginAppSrv.USER_CONTEXT.TEACHER : LoginAppSrv.USER_CONTEXT.STUDENT,
                        changePassword: false
                    };

                    LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                    scope.currentUserContext = isTeacherApp ? 'teacher' : 'student';
                    scope.currentForm = 'login';
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
        }
    );
})(angular);
