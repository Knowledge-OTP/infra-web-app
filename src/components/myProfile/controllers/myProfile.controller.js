(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('MyProfileController',
            function (AuthService, $mdDialog, $timeout, userProfile, timezonesList, localTimezone) {
                'ngInject';

                var vm = this;

                vm.userProfile = userProfile;
                vm.timezonesList = timezonesList;
                vm.localTimezone = localTimezone;

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }
        );
})(angular);
