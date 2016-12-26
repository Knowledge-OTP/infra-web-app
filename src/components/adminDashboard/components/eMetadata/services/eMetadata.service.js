(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('EMetadataService',
            function ($mdDialog, $http, ENV, $q, InfraConfigSrv, $log) {
                'ngInject';


                var self = this;
                //  var profilePath = ENV.backendEndpoint + "/teachworks/zinkerzTeacher/all";
                var profilePath = "http://localhost:3009/teachworks/zinkerzTeacher/all";
                var globalStorageProm = InfraConfigSrv.getGlobalStorage();

                var satURL = "https://sat-dev.firebaseio.com";
                var actURL = "https://act-dev.firebaseio.com";
                var tofelURL = "https://znk-toefl-dev.firebaseio.com";

                if (!ENV.debug) {
                    // satURL = "https://sat-dev.firebaseio.com/";
                    // actURL = "https://act-dev.firebaseio.com/";
                    // tofelURL = "https://znk-toefl-dev.firebaseio.com/";
                }


                self.showEducatorProfile = function (userProfile) {
                    $q.all([getTimezonesList(), getLocalTimezone()]).then(function (values) {
                        var timezonesList = values[0];
                        var localTimezone = values[1];
                        $mdDialog.show({
                            locals: {
                                userProfile: userProfile,
                                timezonesList: obj2Array(timezonesList),
                                localTimezone: localTimezone
                            },
                            controller: 'AdminProfileController',
                            controllerAs: 'vm',
                            templateUrl: 'app/admin/eMetadata/templates/educatorProfile.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    });

                };

                self.updateProfile = function (newProfile) {
                    var fullPath = "users/" + newProfile.uid + "/profile";
                    return InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                        return globalStorage.update(fullPath, newProfile);
                    });
                };
                self.setZinkerzTeacher = function (uid, subject, isZinkerzTeacher) {
                    if (!uid) {
                        $log.error('setZinkerzTeacher: no uid');
                        return;
                    }
                    if (!subject) {
                        $log.error('setZinkerzTeacher: no subject');
                        return;
                    }
                    var profile = {
                        userId: uid,
                        isZinkerzTeacher: !!isZinkerzTeacher,
                        teachingSubject: subject,
                        fbUrls: [satURL, actURL, tofelURL]
                    };
                    return $http.post(profilePath, profile);
                };

                function obj2Array(obj) {
                    return Object.keys(obj).map(function (key) {
                        return obj[key];
                    });
                }

                function getTimezonesList() {
                    return globalStorageProm.then(function (globalStorage) {
                        return globalStorage.get('timezones');
                    });
                }
                function getLocalTimezone() {
                    var localTimezone;
                    var dateArray = new Date().toString().split(' ');
                    var timezoneCity = dateArray.find(function (item) {
                        return (item.indexOf('(') !== -1);
                    });

                    timezoneCity = timezoneCity ? timezoneCity.replace('(', '') : null;

                    return getTimezonesList().then(function (timezonesList) {
                        if (timezoneCity) {
                            timezonesList = obj2Array(timezonesList);
                            localTimezone = timezonesList.find(function (timezone) {
                                return (timezone.indexOf(timezoneCity) !== -1);
                            });
                        } else {
                            if (!localTimezone) {
                                var timezoneGMT = dateArray.find(function (item) {
                                    return (item.indexOf('GMT') !== -1);
                                });
                                localTimezone = timezonesList.find(function (timezone) {
                                    timezone = timezone.replace(':', '');
                                    return (timezone.indexOf(timezoneGMT) !== -1);
                                });
                            }
                        }

                        return localTimezone;
                    });
                }

            }
        );
})(angular);


