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

                function getLocalTimezone() {
                    var dateArray = new Date().toString().split(' ');
                    var timezoneCity = dateArray.find(function (item) {
                        return (item.indexOf('(')!== -1);
                    });
                    timezoneCity = timezoneCity.replace('(', '');

                    var localTimezone = vm.timezonesList.find(function (timezone) {
                        return (timezone.indexOf(timezoneCity)!== -1);
                    });

                    if (!localTimezone){
                        var timezoneGMT = dateArray.find(function (item) {
                            return (item.indexOf('GMT')!== -1);
                        });
                        localTimezone = vm.timezonesList.find(function (timezone) {
                            timezone = timezone.replace(':', '');
                            return (timezone.indexOf(timezoneGMT)!== -1);
                        });
                    }
                    return localTimezone;
                }

                var vm = this;

                var defaultTimeZone = getLocalTimezone();
                var userAuth = AuthService.getAuth();

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.nicknameError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.generalError = 'MY_PROFILE.ERROR_OCCURRED';
                vm.profileData = {};

                vm.profileData.nickname = vm.userProfile.nickname ? vm.userProfile.nickname : userAuth.auth.email;
                vm.profileData.email = vm.userProfile.email ? vm.userProfile.email : userAuth.auth.email;
                vm.profileData.timezone = vm.userProfile.isTimezoneManual ? vm.userProfile.timezone : defaultTimeZone;
                vm.profileData.isTimezoneManual = vm.userProfile.isTimezoneManual ? vm.userProfile.isTimezoneManual : false;


                vm.updateProfile = function (profileform) {
                    vm.showError = vm.showSuccess = false;

                    if (profileform.$valid) {
                        UserProfileService.setProfile(vm.profileData).then(function () {
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

                vm.updateProfileTimezone = function () {
                    if (!vm.profileData.isTimezoneManual){
                        vm.profileData.timezone = defaultTimeZone;
                    }
                };
            }
        });
})(angular);
