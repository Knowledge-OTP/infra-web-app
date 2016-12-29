(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('EMetadataService',
            function ($mdDialog, $http, ENV, $q, InfraConfigSrv, $log, MyProfileSrv) {
                'ngInject';


                var self = this;
                var profilePath = ENV.backendEndpoint + "/teachworks/zinkerzTeacher/all";

                var satURL = "https://sat-dev.firebaseio.com";
                var actURL = "https://act-dev.firebaseio.com";
                var tofelURL = "https://znk-toefl-dev.firebaseio.com";

                if (!ENV.debug) {
                    satURL = "https://sat-prod.firebaseio.com/";
                    actURL = "https://act-prod.firebaseio.com/";
                    tofelURL = "https://znk-toefl-prod.firebaseio.com/";
                }


                self.showEducatorProfile = function (userProfile) {
                    $q.all([MyProfileSrv.getTimezonesList(), MyProfileSrv.getLocalTimezone()]).then(function (values) {
                        var timezonesList = values[0];
                        var localTimezone = values[1];
                        $mdDialog.show({
                            locals: {
                                userProfile: userProfile,
                                timezonesList: obj2Array(timezonesList),
                                localTimezone: localTimezone
                            },
                            controller: 'EducatorProfileController',
                            controllerAs: 'vm',
                            templateUrl: 'components/adminDashboard/components/eMetadata/templates/educatorProfile.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    });

                };

                self.updateProfile = function (newProfile) {
                    var copiedProfile = angular.copy(newProfile);
                    var uid = copiedProfile.uid;
                    if (uid) {
                        delete copiedProfile.uid;
                    }
                    var fullPath = "users/" + uid + "/profile";
                    return InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                        return globalStorage.update(fullPath, copiedProfile);
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
            }
        );
})(angular);


