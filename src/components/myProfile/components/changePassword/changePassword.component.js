(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('changePassword', {
            bindings: {},
            templateUrl:  'components/myProfile/components/changePassword/changePassword.template.html',
            controllerAs: 'vm',
            controller: function (AuthService, $mdDialog, $timeout, MyProfileSrv) {
                'ngInject';

                var vm = this;
                var showToast = MyProfileSrv.showToast;

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.oldPassError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.changePasswordData = {};

                vm.changePassword = function (authform) {
                    var type, msg;

                    if (vm.changePasswordData.newPassword !== vm.changePasswordData.newPasswordConfirm) {
                        vm.changePasswordData.newPasswordConfirm = undefined;
                        return;
                    }

                    if (!authform.$invalid) {
                        AuthService.changePassword(vm.changePasswordData).then(function () {
                            $timeout(function () {
                                type = 'success';
                                msg = 'MY_PROFILE.PASSWORD_SAVE_SUCCESS';
                                showToast(type, msg);
                            }, 10);
                        }, function (err) {
                            $timeout(function () {
                                type = 'error';
                                if (err.code === 'INVALID_PASSWORD') {
                                    vm.changePasswordData.oldPassword = null;
                                    msg = 'MY_PROFILE.INCORRECT_PASSWORD';
                                    showToast(type, msg);
                                } else if (err.code === 'NETWORK_ERROR') {
                                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                    showToast(type, msg);
                                } else {
                                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                                    showToast(type, msg);
                                }
                            }, 10);
                        });
                    }
                };

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };

            }
        });
})(angular);
