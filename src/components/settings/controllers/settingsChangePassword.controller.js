(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').controller('SettingsChangePasswordController',
            function (AuthService, $mdDialog, $timeout, $translatePartialLoader) {
                'ngInject';

                $translatePartialLoader.addPart('settings');

                var self = this;
                this.saveTitle = 'SETTING.SAVE';
                this.oldPassError = 'SETTING.REQUIRED_FIELD';
                this.generalError = 'SETTING.ERROR_OCCURRED';
                this.changePasswordData = {};

                self.changePassword = function (authform) {
                    self.showError = self.showSuccess = false;

                    if (self.changePasswordData.newPassword !== self.changePasswordData.newPasswordConfirm) {
                        self.changePasswordData.newPasswordConfirm = undefined;
                        return;
                    }

                    if (!authform.$invalid) {
                        self.startLoader = true;
                        AuthService.changePassword(self.changePasswordData).then(function () {
                            self.fillLoader = true;
                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                self.showSuccess = true;
                                self.saveTitle = 'SETTING.DONE';
                            }, 100);
                        }, function (err) {
                            self.fillLoader = true;

                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                if (err.code === 'INVALID_PASSWORD') {
                                    self.changePasswordData.oldPassword = null;
                                    self.oldPassError = 'SETTING.INCORRECT_PASSWORD';
                                } else if (err.code === 'NETWORK_ERROR') {
                                    self.generalError = 'SETTING.NO_INTERNET_CONNECTION_ERR';
                                    self.showError = true;
                                } else {
                                    self.showError = true;
                                }
                            }, 100);
                        });
                    }
                };

                self.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }
        );
})(angular);
