(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('EMetadataService',
            function ($mdDialog, $http, ENV, $q, InfraConfigSrv, $log, MyProfileSrv, UtilitySrv) {
                'ngInject';


                var self = this;

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

            }
        );
})(angular);


