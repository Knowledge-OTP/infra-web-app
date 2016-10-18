(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            function ($mdDialog, $http, ENV, UserProfileService ,$q, $mdToast) {
                'ngInject';

                var self = this;

                this.getTimezonesList = function () {
                    return $http.get('./assets/timezones.json', {
                        timeout: 5000,
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

                this.showToast = function (type, msg) {
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
