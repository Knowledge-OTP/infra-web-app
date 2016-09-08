/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp',
        function ($translatePartialLoader, LoginAppSrv, $location, $timeout, $document) {
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
                        userContext: LoginAppSrv.USER_CONTEXT.STUDENT
                    };

                    var socialProvidersArr = ['facebook', 'google'];

                    LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                    scope.currentUserContext =  'student';
                    scope.currentForm = 'signup';
                    scope.d.loaderSettings = {
                        loaderColor: '#088E9E',
                        buttonBg: '#0a9bad'
                    };

                    scope.selectApp = function(app) {
                        scope.d.appContext = app;
                        LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                        // switch (app) {
                        //     case LoginAppSrv.APPS.SAT:
                        //         scope.d.loaderSettings = {
                        //             loaderColor: '#088E9E',
                        //             buttonBg: '#0a9bad'
                        //         };
                        //         break;
                        //     case LoginAppSrv.APPS.ACT:
                        //         scope.d.loaderSettings = {
                        //             loaderColor: '#72ab40',
                        //             buttonBg: '#87ca4d'
                        //         };
                        //         break;
                        //     case LoginAppSrv.APPS.TOEFL:
                        //         scope.d.loaderSettings = {
                        //             loaderColor: '#e4841d',
                        //             buttonBg: '#ff931e'
                        //         };
                        //         break;
                        // }
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
                        // $location.search('app', null);
                        // $location.search('state', null);
                    }

                    //catching $mdMenuOpen event emitted from angular-material.js
                    scope.$on('$mdMenuOpen', function() {
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
