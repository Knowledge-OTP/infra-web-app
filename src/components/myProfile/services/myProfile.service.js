(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            function ($mdDialog, $http, ENV, UserProfileService ,$q, $mdToast, StorageSrv, InfraConfigSrv) {
                'ngInject';

                function obj2Array(obj) {
                    return Object.keys(obj).map(function (key) { return obj[key]; });
                }

                var self = this;
                var globalStorageProm = InfraConfigSrv.getGlobalStorage();

                self.getTimezonesList = function getTimezonesList() {
                    return globalStorageProm.then(function (globalStorage) {
                        return globalStorage.get('timezones');
                    });
                };

                self.getLocalTimezone = function () {
                    var dateArray = new Date().toString().split(' ');
                    var timezoneCity = dateArray.find(function (item) {
                        return (item.indexOf('(')!== -1);
                    });
                    timezoneCity = timezoneCity.replace('(', '');

                    return self.getTimezonesList().then(function (timezonesList) {
                        timezonesList = obj2Array(timezonesList);
                        var localTimezone = timezonesList.find(function (timezone) {
                            return (timezone.indexOf(timezoneCity)!== -1);
                        });

                        if (!localTimezone){
                            var timezoneGMT = dateArray.find(function (item) {
                                return (item.indexOf('GMT')!== -1);
                            });
                            localTimezone = timezonesList.find(function (timezone) {
                                timezone = timezone.replace(':', '');
                                return (timezone.indexOf(timezoneGMT)!== -1);
                            });
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

                self.showToast = function (type, msg) {
                    $mdToast.show({
                        locals:{ type: type,  msg: msg },
                        templateUrl: 'components/myProfile/templates/toast.template.html',
                        position: 'top right',
                        hideDelay: 3000,
                        controllerAs: 'vm',
                        controller: 'ToastController'
                    });
                };
            }
        );
})(angular);
