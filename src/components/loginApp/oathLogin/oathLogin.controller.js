/* jshint ignore:start */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').controller('OathLoginDrvController',
        function($q, LoginAppSrv, $window, $log, $auth, UserProfileService) {
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

                    UserProfileService.getProfileByUserId(userDataAuth.uid).then(function (userProfile) {
                        var createUserProfileProm;
                        if (Object.keys(userProfile).length === 0) {
                            var nickname = userDataAuth.nickname || userDataAuth.name;
                            createUserProfileProm = UserProfileService.createUserProfile(userDataAuth.uid, userDataAuth.email, nickname, provider);
                        } else {
                            createUserProfileProm = $q.when(null);
                        }

                        LoginAppSrv.addFirstRegistrationRecord(vm.appContext.id, vm.userContext);

                        loadingProvider.showSpinner = false;

                        createUserProfileProm.then(function () {
                            LoginAppSrv.redirectToPage(vm.appContext.id, vm.userContext);
                        });
                    });
                }).catch(function (error) {
                    $log.error('OathLoginDrvController socialAuth', error);
                    loadingProvider.showSpinner = false;
                });
            };

        });
})(angular);
/* jshint ignore:end */
