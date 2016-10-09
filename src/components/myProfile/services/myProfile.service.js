(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            function ($mdDialog, $http, ENV, UserProfileService ,$q) {
                'ngInject';

                var self = this;

                this.getTimezonesList = function () {
                    return $http.get(ENV.timezonesJsonUrl, {
                        timeout: ENV.promiseTimeOut,
                        cache: true
                    });
                };


                var timezonesProm = self.getTimezonesList();
                this.showMyProfile = function () {
                    var userProfileProm = UserProfileService.getProfile();

                    $q.all([userProfileProm, timezonesProm]).then(function(values) {
                        var userProfile = values[0];
                        var timezonesList = values[1].data;
                        $mdDialog.show({
                            locals:{ userProfile: userProfile,  timezonesList: timezonesList },
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
