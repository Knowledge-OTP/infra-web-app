(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            function ($mdDialog, $http, ENV, UserProfileService ,$q, $mdToast) {
                'ngInject';

                function getTimezonesList() {
                    return $http.get('./assets/timezones.json', {
                        timeout: 5000,
                        cache: true
                    });
                }

                var self = this;
                var timezonesProm = getTimezonesList();

                self.getLocalTimezone = function () {
                    var dateArray = new Date().toString().split(' ');
                    var timezoneCity = dateArray.find(function (item) {
                        return (item.indexOf('(')!== -1);
                    });
                    timezoneCity = timezoneCity.replace('(', '');

                    return timezonesProm.then(function (timezonesList) {
                        timezonesList = timezonesList.data;
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

                    $q.all([userProfileProm, timezonesProm, self.getLocalTimezone()]).then(function(values) {
                        console.log('values: ', values);
                        var userProfile = values[0];
                        var timezonesList = values[1].data;
                        var localTimezone = values[2];
                        $mdDialog.show({
                            locals:{
                                userProfile: userProfile,
                                timezonesList: timezonesList,
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
