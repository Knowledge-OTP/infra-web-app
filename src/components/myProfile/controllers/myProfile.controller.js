(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('MyProfileController',
            function (AuthService, $mdDialog, $timeout, $translatePartialLoader) {
                'ngInject';

                $translatePartialLoader.addPart('myProfile');

                var self = this;
                this.saveTitle = 'MY_PROFILE.SAVE';
                this.oldPassError = 'MY_PROFILE.REQUIRED_FIELD';
                this.generalError = 'MY_PROFILE.ERROR_OCCURRED';
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
                                self.saveTitle = 'MY_PROFILE.DONE';
                            }, 100);
                        }, function (err) {
                            self.fillLoader = true;

                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                if (err.code === 'INVALID_PASSWORD') {
                                    self.changePasswordData.oldPassword = null;
                                    self.oldPassError = 'MY_PROFILE.INCORRECT_PASSWORD';
                                } else if (err.code === 'NETWORK_ERROR') {
                                    self.generalError = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
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
