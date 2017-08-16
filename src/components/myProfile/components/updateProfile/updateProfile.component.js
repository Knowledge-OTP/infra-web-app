(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('updateProfile', {
            bindings: {
                userProfile: '=',
                timezonesList: '=',
                localTimezone: '='
            },
            templateUrl:  'components/myProfile/components/updateProfile/updateProfile.template.html',
            controllerAs: 'vm',
            controller:  function ($rootScope, AuthService, $mdDialog, $timeout, UserProfileService, MyProfileSrv) {
                'ngInject';

                var vm = this;
                var userAuth = AuthService.getAuth();
                var showToast = MyProfileSrv.showToast;

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.nicknameError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.profileData = {};

                vm.profileData.nickname = vm.userProfile.nickname ? vm.userProfile.nickname : userAuth.email;
                vm.profileData.email = vm.userProfile.email ? vm.userProfile.email : userAuth.email;
                vm.profileData.timezone = vm.userProfile.isTimezoneManual ? vm.userProfile.timezone : vm.localTimezone;
                vm.profileData.isTimezoneManual = vm.userProfile.isTimezoneManual ? vm.userProfile.isTimezoneManual : false;

                vm.updateProfile = function (profileform) {
                    var type, msg;

                    if (profileform.$valid && profileform.$dirty) {
                        UserProfileService.setProfile(vm.profileData).then(function () {
                            $timeout(function () {
                                type = 'success';
                                msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                                showToast(type, msg);
                                $rootScope.$broadcast('profile-updated', { profile: vm.profileData });
                            });
                        }, function (err) {
                            $timeout(function () {
                                type = 'error';
                                if (err.code === 'NETWORK_ERROR') {
                                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                    showToast(type, msg);
                                } else {
                                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                                    showToast(type, msg);
                                }
                            });
                        });
                    }
                };

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };

                vm.updateProfileTimezone = function () {
                    if (!vm.profileData.isTimezoneManual){
                        vm.profileData.timezone = vm.localTimezone;
                    }
                };
            }
        });
})(angular);
