(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('updateProfile', {
            bindings: {
                userProfile: '=',
                timezonesList: '='
            },
            templateUrl:  'components/myProfile/components/updateProfile/updateProfile.template.html',
            controllerAs: 'vm',
            controller:  function (AuthService, $mdDialog, $timeout, UserProfileService) {
                'ngInject';
                
                var vm = this;

                var defaultTimeZone = '(GMT-07:00) Mountain Time (US & Canada)';
                var userAuth = AuthService.getAuth();

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.nicknameError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.generalError = 'MY_PROFILE.ERROR_OCCURRED';
                vm.profileData = {};

                vm.profileData.nickname = vm.userProfile.nickname ? vm.userProfile.nickname : userAuth.auth.email;
                vm.profileData.email = vm.userProfile.email ? vm.userProfile.email : userAuth.auth.email;
                vm.profileData.timezone = vm.userProfile.timezone ? vm.userProfile.timezone : defaultTimeZone;
                vm.profileData.isTimezoneManual = vm.userProfile.isTimezoneManual ? vm.userProfile.isTimezoneManual : false;


                vm.updateProfile = function (profileform) {
                    vm.showError = vm.showSuccess = false;

                    if (profileform.$valid) {
                        UserProfileService.setProfile(vm.profileData).then(function (res) {
                            $timeout(function () {
                                vm.showSuccess = true;
                                vm.saveTitle = 'MY_PROFILE.DONE';
                            }, 100);
                        }, function (err) {
                            $timeout(function () {
                                if (err.code === 'NETWORK_ERROR') {
                                    vm.generalError = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                    vm.showError = true;
                                } else {
                                    vm.showError = true;
                                }
                            }, 100);
                        });
                    }
                };

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }
        });
})(angular);
