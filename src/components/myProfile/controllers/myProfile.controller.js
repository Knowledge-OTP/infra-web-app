(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('MyProfileController',
            function (AuthService, $mdDialog, $timeout, $translatePartialLoader, userProfile, timezonesList) {
                'ngInject';

                $translatePartialLoader.addPart('myProfile');

                var vm = this;

                vm.userProfile = userProfile;
                vm.timezonesList = timezonesList;

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }
        );
})(angular);
