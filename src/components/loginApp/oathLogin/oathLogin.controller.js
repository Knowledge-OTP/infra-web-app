/* jshint ignore:start */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').controller('OathLoginDrvController',
        function($window, $log, $auth /* AnalyticsLoginSrv */, $timeout, $filter) {
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

        });
})(angular);
/* jshint ignore:end */
