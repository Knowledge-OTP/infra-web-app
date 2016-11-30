(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            function ($mdDialog, $http, ENV, UserProfileService ,$q, $mdToast, StorageSrv, InfraConfigSrv, ZnkToastSrv) {
                'ngInject';

                function obj2Array(obj) {
                    return Object.keys(obj).map(function (key) { return obj[key]; });
                }

                var self = this;
                var globalStorageProm = InfraConfigSrv.getGlobalStorage();
                self.showToast = ZnkToastSrv.showToast;

                self.getTimezonesList = function getTimezonesList() {
                    return globalStorageProm.then(function (globalStorage) {
                        return globalStorage.get('timezones');
                    });
                };

                self.getLocalTimezone = function () {
                    var localTimezone;
                    var dateArray = new Date().toString().split(' ');
                    var timezoneCity = dateArray.find(function (item) {
                        return (item.indexOf('(')!== -1);
                    });

                    timezoneCity = timezoneCity ? timezoneCity.replace('(', ''): null;

                    return self.getTimezonesList().then(function (timezonesList) {
                        if (timezoneCity) {
                            timezonesList = obj2Array(timezonesList);
                            localTimezone = timezonesList.find(function (timezone) {
                                return (timezone.indexOf(timezoneCity)!== -1);
                            });
                        } else {
                            if (!localTimezone){
                                var timezoneGMT = dateArray.find(function (item) {
                                    return (item.indexOf('GMT')!== -1);
                                });
                                localTimezone = timezonesList.find(function (timezone) {
                                    timezone = timezone.replace(':', '');
                                    return (timezone.indexOf(timezoneGMT)!== -1);
                                });
                            }
                        }

                        return localTimezone;
                    });
                };

                self.showMyProfile = function () {
                    var userProfileProm = UserProfileService.getProfile();

                    $q.all([userProfileProm, self.getTimezonesList(), self.getLocalTimezone()]).then(function(values) {
                        var userProfile = values[0];
                        var timezonesList = values[1];
                        var localTimezone = values[2];
                        $mdDialog.show({
                            locals:{
                                userProfile: userProfile,
                                timezonesList: obj2Array(timezonesList),
                                localTimezone: localTimezone
                            },
                            controller: 'MyProfileController',
                            controllerAs: 'vm',
                            templateUrl: 'components/myProfile/templates/myProfile.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    });
                };
            }
        );
})(angular);
