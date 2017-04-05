(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('EMetadataService',
            function ($mdDialog, $http, ENV, $q, InfraConfigSrv, $log, MyProfileSrv, UtilitySrv) {
                'ngInject';


                var self = this;
                var profilePath = ENV.backendEndpoint + "/teachworks/zinkerzTeacher/all";

                var satURL = "https://sat-dev.firebaseio.com";
                var actURL = "https://act-dev.firebaseio.com";
                var tofelURL = "https://znk-toefl-dev.firebaseio.com";
                var znkURL = "https://znk-dev.firebaseio.com";

                if (!ENV.debug) {
                    satURL = "https://sat2-prod.firebaseio.com/";
                    actURL = "https://act-prod.firebaseio.com/";
                    tofelURL = "https://znk-toefl-prod.firebaseio.com/";
                    znkURL = "https://znk-prod.firebaseio.com";
                }


                self.showEducatorProfile = function (userProfile) {
                    if (!userProfile) {
                        $log.error('showEducatorProfile: userProfile object is not undefined');
                        return;
                    }
                    $q.all([MyProfileSrv.getTimezonesList(), MyProfileSrv.getLocalTimezone()]).then(function (values) {
                        var timezonesList = values[0];
                        var localTimezone = values[1];
                        $mdDialog.show({
                            locals: {
                                userProfile: userProfile,
                                timezonesList: UtilitySrv.object.convertToArray(timezonesList),
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
                    var deferred = $q.defer();
                    var copiedProfile = angular.copy(newProfile);
                    var uid = copiedProfile.uid;
                    if (uid) {
                        delete copiedProfile.uid;
                    }
                    var fullPath = "users/" + uid + "/profile";
                    InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                        globalStorage.update(fullPath, copiedProfile).then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (error) {
                            deferred.reject(error);
                        });
                    });
                    return deferred.promise;
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
                        fbUrls: [satURL, actURL, tofelURL, znkURL] // TODO: remove appURLs after finish moving all users to znk-dev
                    };
                    return $http.post(profilePath, profile);
                };
            }
        );
})(angular);


