(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('MyProfileController',
            function (AuthService, $mdDialog, $timeout, userProfile, timezonesList, localTimezone, MyProfileSrv) {
                'ngInject';

                var vm = this;

                vm.userProfile = userProfile;
                vm.timezonesList = timezonesList;
                vm.localTimezone = localTimezone;
                vm.appName = MyProfileSrv.getAppName();

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }
        );
})(angular);
