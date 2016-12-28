(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .controller('EducatorProfileController', function ($mdDialog, $timeout, userProfile, timezonesList, localTimezone, ZnkToastSrv, EMetadataService, $filter) {
            'ngInject';
            var self = this;
            var translateFilter = $filter('translate');

            self.timezonesList = timezonesList;
            self.profileData = userProfile;
            self.profileData.educatorTeachworksName = self.profileData.name;
            self.profileData.timezone = localTimezone;
            self.profileData.educatorAvailabilityHours = translateFilter("ADMIN.EMETADATA.FROM_TO");
            self.isTimezoneManual = false;

            self.closeDialog = function () {
                $mdDialog.cancel();
            };

            self.updateProfileTimezone = function () {
                if (!self.profileData.isTimezoneManual) {
                    self.profileData.timezone = localTimezone;
                }
            };
            self.updateProfile = function (profileform) {
                var type, msg;

                if (profileform.$valid && profileform.$dirty) {
                    EMetadataService.updateProfile(self.profileData).then(function () {
                        $timeout(function () {
                            type = 'success';
                            msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                            _showNotification(type, msg);
                        });
                    }, function (err) {
                        $timeout(function () {
                            type = 'error';
                            if (err.code === 'NETWORK_ERROR') {
                                msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                _showNotification(type, msg);
                            } else {
                                type = 'error';
                                msg = 'MY_PROFILE.ERROR_OCCURRED';
                                _showNotification(type, msg);
                            }
                        });
                    });
                }
            };

            self.setZinkerzTeacher = function (profileZinkerzTeacherform) {
                var type, msg;

                if (profileZinkerzTeacherform.$valid && profileZinkerzTeacherform.$dirty) {
                    EMetadataService.setZinkerzTeacher(self.profileData.uid, self.profileData.zinekrzTeacherSubject,self.profileData.zinkerzTeacher).then(function () {
                        $timeout(function () {
                            type = 'success';
                            msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                            _showNotification(type, msg);
                        });
                    }, function (err) {
                        $timeout(function () {
                            type = 'error';
                            if (err.code === 'NETWORK_ERROR') {
                                msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                _showNotification(type, msg);
                            } else {
                                type = 'error';
                                msg = 'MY_PROFILE.ERROR_OCCURRED';
                                _showNotification(type, msg);
                            }
                        });
                    });
                }
            };

            function _showNotification(type, msg) {
                ZnkToastSrv.showToast(type, msg);
            }

        });
})(angular);
