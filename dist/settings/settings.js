(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'znk.infra.general'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'settings-change-password-icon': 'components/settings/svg/change-password-icon.svg',
                'settings-danger-red-icon': 'components/settings/svg/error-icon.svg',
                'settings-close-popup': 'components/settings/svg/setting-close-popup.svg',
                'settings-completed-v-icon': 'components/settings/svg/completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').controller('SettingsChangePasswordController',
            ["AuthService", "$mdDialog", "$timeout", function (AuthService, $mdDialog, $timeout) {
                'ngInject';

                var self = this;
                this.saveTitle = 'SETTING.SAVE';
                this.oldPassError = 'SETTING.REQUIRED_FIELD';
                this.generalError = 'SETTING.ERROR_OCCURRED';
                this.changePasswordData = {};

                self.changePassword = function (authform) {
                    self.showError = self.showSuccess = false;

                    if (self.changePasswordData.newPassword !== self.changePasswordData.newPasswordConfirm) {
                        self.changePasswordData.newPasswordConfirm = undefined;
                        return;
                    }

                    if (!authform.$invalid) {
                        self.startLoader = true;
                        AuthService.changePassword(self.changePasswordData).then(function () {
                            self.fillLoader = true;
                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                self.showSuccess = true;
                                self.saveTitle = 'SETTING.DONE';
                            }, 100);
                        }, function (err) {
                            self.fillLoader = true;

                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                if (err.code === 'INVALID_PASSWORD') {
                                    self.changePasswordData.oldPassword = null;
                                    self.oldPassError = 'SETTING.INCORRECT_PASSWORD';
                                } else if (err.code === 'NETWORK_ERROR') {
                                    self.generalError = 'SETTING.NO_INTERNET_CONNECTION_ERR';
                                    self.showError = true;
                                } else {
                                    self.showError = true;
                                }
                            }, 100);
                        });
                    }
                };

                self.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings')
        .service('SettingsSrv',
            ["$mdDialog", function ($mdDialog) {
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
            }]
        );
})(angular);

angular.module('znk.infra-web-app.settings').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/settings/svg/change-password-icon.svg",
    "<svg class=\"change-password-icon-wrap\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 75 75\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .change-password-icon-wrap{\n" +
    "            width: 100%;\n" +
    "            height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "<path d=\"M52.5,30c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5s7.5,3.4,7.5,7.5S56.6,30,52.5,30z M52.5,0C40.1,0,30,10.1,30,22.5V30L0,60\n" +
    "	v15h15v-7.5h7.5V60H30v-7.5h7.5V45h15C64.9,45,75,34.9,75,22.5S64.9,0,52.5,0z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/svg/completed-v.svg",
    "<svg\n" +
    "	class=\"complete-v-icon-svg\"\n" +
    "	xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "	xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "	y=\"0px\"\n" +
    "	viewBox=\"-1040 834.9 220.4 220.4\"\n" +
    "	style=\"enable-background:new -1040 834.9 220.4 220.4; width: 100%; height: auto;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.complete-v-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st1 {\n" +
    "        fill: #CACBCC;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st2 {\n" +
    "        display: none;\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st3 {\n" +
    "        fill: #D1D2D2;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st4 {\n" +
    "        fill: none;\n" +
    "        stroke: #FFFFFF;\n" +
    "        stroke-width: 11.9321;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/svg/error-icon.svg",
    "<svg\n" +
    "    class=\"settings-error-icon\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 54.8 49.1\">\n" +
    "<path class=\"st0\" d=\"M54,39.8L32.8,3.1C30.4-1,24.4-1,22,3.1L0.8,39.8c-2.4,4.1,0.6,9.3,5.4,9.3h42.4C53.4,49.1,56.4,44,54,39.8z\n" +
    "	 M29.8,42.9c-0.7,0.6-1.5,0.9-2.4,0.9c-0.9,0-1.7-0.3-2.4-0.9s-1-1.4-1-2.5c0-0.9,0.3-1.7,1-2.4s1.5-1,2.4-1s1.8,0.3,2.4,1\n" +
    "	c0.7,0.7,1,1.5,1,2.4C30.8,41.4,30.5,42.2,29.8,42.9z M30.7,17.7l-1,11.2c-0.1,1.3-0.3,2.4-0.7,3.1c-0.3,0.7-0.9,1.1-1.7,1.1\n" +
    "	c-0.8,0-1.4-0.3-1.7-1c-0.3-0.7-0.5-1.7-0.7-3.1l-0.7-10.9C24,15.8,24,14.3,24,13.4c0-1.3,0.3-2.2,1-2.9s1.5-1.1,2.6-1.1\n" +
    "	c1.3,0,2.2,0.5,2.6,1.4c0.4,0.9,0.7,2.2,0.7,3.9C30.8,15.6,30.8,16.6,30.7,17.7z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/svg/setting-close-popup.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\" class=\"settings-close-popup\">\n" +
    "    <style>\n" +
    "        .settings-close-popup{\n" +
    "        width:15px;\n" +
    "        height:15px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/templates/settingsChangePassword.template.html",
    "<md-dialog ng-cloak class=\"setting-change-password\" translate-namespace=\"SETTING\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeDialog()\">\n" +
    "            <svg-icon name=\"settings-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content ng-switch=\"!!vm.showSuccess\">\n" +
    "        <div class=\"main-title md-subheader\" translate=\".CHANGE_PASSWORD\"></div>\n" +
    "        <form name=\"authform\" novalidate class=\"auth-form\" ng-submit=\"vm.changePassword(authform)\" ng-switch-when=\"false\">\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.changePasswordData.oldPassword && authform.$submitted}\">\n" +
    "                <input\n" +
    "                    type=\"password\"\n" +
    "                    autocomplete=\"off\"\n" +
    "                    placeholder=\"{{'SETTING.OLD_PASSWORD' | translate}}\"\n" +
    "                    name=\"oldPassword\"\n" +
    "                    ng-minlength=\"6\"\n" +
    "                    ng-maxlength=\"25\"\n" +
    "                    ng-required=\"true\"\n" +
    "                    ng-model=\"vm.changePasswordData.oldPassword\">\n" +
    "                <div class=\"error-msg\" translate=\"{{vm.oldPassError}}\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.changePasswordData.newPassword && authform.$submitted}\">\n" +
    "                <input\n" +
    "                    type=\"password\"\n" +
    "                    autocomplete=\"off\"\n" +
    "                    placeholder=\"{{'SETTING.NEW_PASSWORD' | translate}}\"\n" +
    "                    name=\"newPassword\"\n" +
    "                    ng-minlength=\"6\"\n" +
    "                    ng-maxlength=\"25\"\n" +
    "                    ng-required=\"true\"\n" +
    "                    ng-model=\"vm.changePasswordData.newPassword\">\n" +
    "                <div class=\"error-msg\" translate=\".PASSWORD_LENGTH\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.changePasswordData.newPasswordConfirm && authform.$submitted}\">\n" +
    "                <input\n" +
    "                    type=\"password\"\n" +
    "                    autocomplete=\"off\"\n" +
    "                    placeholder=\"{{'SETTING.CONFIRM_NEW_PASSWORD' | translate}}\"\n" +
    "                    name=\"newPasswordConfirm\"\n" +
    "                    ng-minlength=\"6\"\n" +
    "                    ng-maxlength=\"25\"\n" +
    "                    ng-required=\"true\"\n" +
    "                    ng-model=\"vm.changePasswordData.newPasswordConfirm\">\n" +
    "                <div class=\"error-msg\" translate=\".PASSWORD_NOT_MATCH\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <button\n" +
    "                    class=\"md-button md-primary green znk drop-shadow\"\n" +
    "                    element-loader\n" +
    "                    fill-loader=\"vm.fillLoader\"\n" +
    "                    show-loader=\"vm.startLoader\"\n" +
    "                    bg-loader=\"'#72ab40'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#87ca4d'\">\n" +
    "                   <span translate=\"{{vm.saveTitle}}\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"settings-completed-v-icon\"></svg-icon>\n" +
    "            <div translate=\".SAVE_SUCCESS\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button aria-label=\"{{'SETTING.DONE' | translate}}\"\n" +
    "                    class=\"success drop-shadow md-primary green znk\" ng-click=\"vm.closeDialog()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"msg-wrap\" ng-class=\"{'show-error': vm.showError}\">\n" +
    "            <div class=\"error-msg\">\n" +
    "                <svg-icon name=\"settings-danger-red-icon\" class=\"settings-danger-red-icon\"></svg-icon>\n" +
    "                <div translate=\"{{vm.generalError}}\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"settings-change-password-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);
