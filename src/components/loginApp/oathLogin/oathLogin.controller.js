/* jshint ignore:start */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').controller('OathLoginDrvController',
        function(LoginAppSrv, $window, $log, $auth, UserProfileService) {
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

                    UserProfileService.getProfile().then(function (userProfile) {
                        var updateProfile = false;
                        if (!userProfile) {
                            userProfile = {
                                email: userDataAuth.email,
                                nickname: userDataAuth.nickname || userDataAuth.name,
                                createdTime: Firebase.ServerValue.TIMESTAMP,
                                provider: provider
                            };
                            updateProfile = true;
                        }

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
                            UserProfileService.setProfile(userProfile, userDataAuth.uid).then(function () {
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

        });
})(angular);
/* jshint ignore:end */
