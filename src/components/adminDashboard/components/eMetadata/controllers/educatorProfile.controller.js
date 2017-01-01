(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .controller('EducatorProfileController', function ($mdDialog, $timeout, userProfile, timezonesList, localTimezone, ZnkToastSrv, EMetadataService, $filter) {
            'ngInject';
            var self = this;
            var translateFilter = $filter('translate');

            self.timezonesList = timezonesList;
            self.profileData = userProfile;
            self.profileData.educatorTeachworksName = self.profileData.educatorTeachworksName || self.profileData.nickname;
            self.profileData.timezone = localTimezone;
            self.profileData.educatorAvailabilityHours = self.profileData.educatorAvailabilityHours || translateFilter("ADMIN.EMETADATA.FROM_TO");
            self.isTimezoneManual = false;

            self.closeDialog = function () {
                $mdDialog.cancel();
            };

            self.updateProfileTimezone = function () {
                if (!self.profileData.isTimezoneManual) {
                    self.profileData.timezone = localTimezone;
                }
            };
            self.updateProfile = function (profileForm) {
                if (profileForm.$valid && profileForm.$dirty) {
                    EMetadataService.updateProfile(self.profileData).then(_profileSuccess, _profileError);
                }
            };

            self.setZinkerzTeacher = function (profileZinkerzTeacherForm) {
                if (profileZinkerzTeacherForm.$valid && profileZinkerzTeacherForm.$dirty) {
                    EMetadataService.setZinkerzTeacher(self.profileData.uid, self.profileData.zinkerzTeacherSubject, self.profileData.zinkerzTeacher).then(_profileSuccess, _profileError);
                }
            };
            function _profileSuccess() {
                var type, msg;
                type = 'success';
                msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                _showNotification(type, msg);
            }

            function _profileError(error) {
                var type, msg;

                type = 'error';
                if (error.code === 'NETWORK_ERROR') {
                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                    _showNotification(type, msg);
                } else {
                    type = 'error';
                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                    _showNotification(type, msg);
                }
            }

            function _showNotification(type, msg) {
                ZnkToastSrv.showToast(type, msg);
            }

        });
})(angular);
