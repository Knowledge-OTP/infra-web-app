(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('changePassword', {
            bindings: {},
            templateUrl:  'components/myProfile/components/changePassword/changePassword.template.html',
            controllerAs: 'vm',
            controller: function (AuthService, $mdDialog, $timeout) {
                'ngInject';

                var vm = this;
                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.oldPassError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.generalError = 'MY_PROFILE.ERROR_OCCURRED';
                vm.changePasswordData = {};

                vm.changePassword = function (authform) {
                    vm.showError = vm.showSuccess = false;

                    if (vm.changePasswordData.newPassword !== vm.changePasswordData.newPasswordConfirm) {
                        vm.changePasswordData.newPasswordConfirm = undefined;
                        return;
                    }

                    if (!authform.$invalid) {
                        vm.startLoader = true;
                        AuthService.changePassword(vm.changePasswordData).then(function () {
                            vm.fillLoader = true;
                            $timeout(function () {
                                vm.startLoader = vm.fillLoader = false;
                                vm.showSuccess = true;
                                vm.saveTitle = 'MY_PROFILE.DONE';
                            }, 100);
                        }, function (err) {
                            vm.fillLoader = true;

                            $timeout(function () {
                                vm.startLoader = vm.fillLoader = false;
                                if (err.code === 'INVALID_PASSWORD') {
                                    vm.changePasswordData.oldPassword = null;
                                    vm.oldPassError = 'MY_PROFILE.INCORRECT_PASSWORD';
                                } else if (err.code === 'NETWORK_ERROR') {
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
