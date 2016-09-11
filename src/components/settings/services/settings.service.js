(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings')
        .service('SettingsSrv',
            function ($mdDialog) {
                'ngInject';

                this.showChangePassword = function () {
                    $mdDialog.show({
                        controller: 'SettingsChangePasswordController',
                        controllerAs: 'vm',
                        templateUrl: 'components/settings/templates/settingsChangePassword.template.html',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    });
                };
            }
        );
})(angular);
