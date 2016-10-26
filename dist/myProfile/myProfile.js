(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'znk.infra.general',
        'znk.infra.storage',
        'znk.infra.user'
    ])
    .config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'myProfile-icon': 'components/myProfile/svg/profile-icon.svg',
                'myProfile-danger-red-icon': 'components/myProfile/svg/error-icon.svg',
                'myProfile-close-popup': 'components/myProfile/svg/close-popup.svg',
                'myProfile-completed-v-icon': 'components/myProfile/svg/completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('changePassword', {
            bindings: {},
            templateUrl:  'components/myProfile/components/changePassword/changePassword.template.html',
            controllerAs: 'vm',
            controller: ["AuthService", "$mdDialog", "$timeout", "MyProfileSrv", function (AuthService, $mdDialog, $timeout, MyProfileSrv) {
                'ngInject';

                var vm = this;
                var showToast = MyProfileSrv.showToast;

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.oldPassError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.changePasswordData = {};

                vm.changePassword = function (authform) {
                    var type, msg;

                    if (vm.changePasswordData.newPassword !== vm.changePasswordData.newPasswordConfirm) {
                        vm.changePasswordData.newPasswordConfirm = undefined;
                        return;
                    }

                    if (!authform.$invalid) {
                        AuthService.changePassword(vm.changePasswordData).then(function () {
                            $timeout(function (res) {
                                console.log('res ', res);
                                type = 'success';
                                msg = 'MY_PROFILE.PASSWORD_SAVE_SUCCESS';
                                showToast(type, msg);
                            }, 10);
                        }, function (err) {
                            console.log('err: ', err);
                            $timeout(function () {
                                type = 'error';
                                if (err.code === 'INVALID_PASSWORD') {
                                    vm.changePasswordData.oldPassword = null;
                                    msg = 'MY_PROFILE.INCORRECT_PASSWORD';
                                    showToast(type, msg);
                                } else if (err.code === 'NETWORK_ERROR') {
                                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                    showToast(type, msg);
                                } else {
                                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                                    showToast(type, msg);
                                }
                            }, 10);
                        });
                    }
                };

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };

            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .component('updateProfile', {
            bindings: {
                userProfile: '=',
                timezonesList: '=',
                localTimezone: '='
            },
            templateUrl:  'components/myProfile/components/updateProfile/updateProfile.template.html',
            controllerAs: 'vm',
            controller:  ["AuthService", "$mdDialog", "$timeout", "UserProfileService", "MyProfileSrv", function (AuthService, $mdDialog, $timeout, UserProfileService, MyProfileSrv) {
                'ngInject';

                var vm = this;
                var userAuth = AuthService.getAuth();
                var showToast = MyProfileSrv.showToast;

                vm.saveTitle = 'MY_PROFILE.SAVE';
                vm.nicknameError = 'MY_PROFILE.REQUIRED_FIELD';
                vm.profileData = {};

                vm.profileData.nickname = vm.userProfile.nickname ? vm.userProfile.nickname : userAuth.auth.email;
                vm.profileData.email = vm.userProfile.email ? vm.userProfile.email : userAuth.auth.email;
                vm.profileData.timezone = vm.userProfile.isTimezoneManual ? vm.userProfile.timezone : vm.localTimezone;
                vm.profileData.isTimezoneManual = vm.userProfile.isTimezoneManual ? vm.userProfile.isTimezoneManual : false;

                vm.updateProfile = function (profileform) {
                    var type, msg;

                    if (profileform.$valid && profileform.$dirty) {
                        UserProfileService.setProfile(vm.profileData).then(function () {
                            $timeout(function () {
                                type = 'success';
                                msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                                showToast(type, msg);
                            }, 10);
                        }, function (err) {
                            $timeout(function () {
                                type = 'error';
                                if (err.code === 'NETWORK_ERROR') {
                                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                    showToast(type, msg);
                                } else {
                                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                                    showToast(type, msg);
                                }
                            }, 10);
                        });
                    }
                };

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };

                vm.updateProfileTimezone = function () {
                    if (!vm.profileData.isTimezoneManual){
                        vm.profileData.timezone = vm.localTimezone;
                    }
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('MyProfileController',
            ["AuthService", "$mdDialog", "$timeout", "$translatePartialLoader", "userProfile", "timezonesList", "localTimezone", function (AuthService, $mdDialog, $timeout, $translatePartialLoader, userProfile, timezonesList, localTimezone) {
                'ngInject';

                $translatePartialLoader.addPart('myProfile');

                var vm = this;

                vm.userProfile = userProfile;
                vm.timezonesList = timezonesList;
                vm.localTimezone = localTimezone;

                vm.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile').controller('ToastController',
        ["$mdToast", "type", "msg", function ($mdToast, type, msg) {
            'ngInject';

            var vm = this;
            vm.type = type;
            vm.msg = msg;

            vm.closeToast = function () {
                $mdToast.hide();
            };

        }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile')
        .service('MyProfileSrv',
            ["$mdDialog", "$http", "ENV", "UserProfileService", "$q", "$mdToast", "StorageSrv", "InfraConfigSrv", function ($mdDialog, $http, ENV, UserProfileService ,$q, $mdToast, StorageSrv, InfraConfigSrv) {
                'ngInject';

                function obj2Array(obj) {
                    return Object.keys(obj).map(function (key) { return obj[key]; });
                }

                var self = this;
                var globalStorageProm = InfraConfigSrv.getGlobalStorage();

                self.getTimezonesList = function getTimezonesList() {
                    return globalStorageProm.then(function (globalStorage) {
                        return globalStorage.get('timezones');
                    });
                };

                self.getLocalTimezone = function () {
                    var dateArray = new Date().toString().split(' ');
                    var timezoneCity = dateArray.find(function (item) {
                        return (item.indexOf('(')!== -1);
                    });
                    timezoneCity = timezoneCity.replace('(', '');

                    return self.getTimezonesList().then(function (timezonesList) {
                        timezonesList = obj2Array(timezonesList);
                        var localTimezone = timezonesList.find(function (timezone) {
                            return (timezone.indexOf(timezoneCity)!== -1);
                        });

                        if (!localTimezone){
                            var timezoneGMT = dateArray.find(function (item) {
                                return (item.indexOf('GMT')!== -1);
                            });
                            localTimezone = timezonesList.find(function (timezone) {
                                timezone = timezone.replace(':', '');
                                return (timezone.indexOf(timezoneGMT)!== -1);
                            });
                        }
                        return localTimezone;
                    });
                };

                self.showMyProfile = function () {
                    var userProfileProm = UserProfileService.getProfile();

                    $q.all([userProfileProm, self.getTimezonesList(), self.getLocalTimezone()]).then(function(values) {
                        var userProfile = values[0];
                        var timezonesList = values[1];
                        var localTimezone = values[2];
                        $mdDialog.show({
                            locals:{
                                userProfile: userProfile,
                                timezonesList: obj2Array(timezonesList),
                                localTimezone: localTimezone
                            },
                            controller: 'MyProfileController',
                            controllerAs: 'vm',
                            templateUrl: 'components/myProfile/templates/myProfile.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    });
                };

                self.showToast = function (type, msg) {
                    $mdToast.show({
                        locals:{ type: type,  msg: msg },
                        templateUrl: 'components/myProfile/templates/toast.template.html',
                        position: 'top right',
                        hideDelay: 3000,
                        controllerAs: 'vm',
                        controller: 'ToastController'
                    });
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.myProfile').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/myProfile/components/changePassword/changePassword.template.html",
    "<md-dialog-content ng-switch=\"!!vm.showSuccess\">\n" +
    "    <div class=\"container-title md-subheader\" translate=\".CHANGE_PASSWORD\"></div>\n" +
    "    <form name=\"authform\" novalidate class=\"auth-form\" ng-submit=\"vm.changePassword(authform)\" ng-switch-when=\"false\">\n" +
    "        <div class=\"znk-input-group\"\n" +
    "             ng-class=\"!vm.changePasswordData.oldPassword && authform.$submitted ? 'invalid' : 'valid'\">\n" +
    "            <label>{{'MY_PROFILE.CURRENT_PASSWORD' | translate}}</label>\n" +
    "            <div class=\"znk-input\">\n" +
    "                <input\n" +
    "                        type=\"password\"\n" +
    "                        autocomplete=\"off\"\n" +
    "                        name=\"oldPassword\"\n" +
    "                        ng-minlength=\"6\"\n" +
    "                        ng-maxlength=\"25\"\n" +
    "                        ng-required=\"true\"\n" +
    "                        ng-model=\"vm.changePasswordData.oldPassword\">\n" +
    "\n" +
    "                <span ng-if=\"!vm.changePasswordData.oldPassword && authform.$submitted\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"authform.oldPassword.$error.required\"\n" +
    "                              translate=\"{{vm.oldPassError}}\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"znk-input-group\"\n" +
    "             ng-class=\"!vm.changePasswordData.newPassword && authform.$submitted ? 'invalid' : 'valid'\">\n" +
    "            <label>{{'MY_PROFILE.NEW_PASSWORD' | translate}}</label>\n" +
    "            <div class=\"znk-input\">\n" +
    "                <input\n" +
    "                        type=\"password\"\n" +
    "                        autocomplete=\"off\"\n" +
    "                        name=\"newPassword\"\n" +
    "                        ng-minlength=\"6\"\n" +
    "                        ng-maxlength=\"25\"\n" +
    "                        ng-required=\"true\"\n" +
    "                        ng-model=\"vm.changePasswordData.newPassword\">\n" +
    "\n" +
    "                <span ng-if=\"!vm.changePasswordData.newPassword && authform.$submitted\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"authform.newPassword.$error.required\"\n" +
    "                              translate=\".PASSWORD_LENGTH\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"znk-input-group\"\n" +
    "             ng-class=\"!vm.changePasswordData.newPasswordConfirm && authform.$submitted ? 'invalid' : 'valid'\">\n" +
    "            <label>{{'MY_PROFILE.CONFIRM_PASSWORD' | translate}}</label>\n" +
    "            <div class=\"znk-input\">\n" +
    "                <input\n" +
    "                        type=\"password\"\n" +
    "                        autocomplete=\"off\"\n" +
    "                        name=\"newPasswordConfirm\"\n" +
    "                        ng-minlength=\"6\"\n" +
    "                        ng-maxlength=\"25\"\n" +
    "                        ng-required=\"true\"\n" +
    "                        ng-model=\"vm.changePasswordData.newPasswordConfirm\">\n" +
    "\n" +
    "                <span ng-if=\"!vm.changePasswordData.newPasswordConfirm && authform.$submitted\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"authform.newPasswordConfirm.$error.required\"\n" +
    "                              translate=\".PASSWORD_NOT_MATCH\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <button class=\"save-pass-btn\"><span translate=\"{{vm.saveTitle}}\"></span></button>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "    <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "        <svg-icon class=\"completed-v-icon-wrap\" name=\"myProfile-completed-v-icon\"></svg-icon>\n" +
    "        <div translate=\".PASSWORD_SAVE_SUCCESS\"></div>\n" +
    "        <div class=\"done-btn-wrap\">\n" +
    "            <md-button class=\"success drop-shadow md-primary green znk\" ng-click=\"vm.closeDialog()\">\n" +
    "                <span translate=\".DONE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"msg-wrap\" ng-class=\"{'show-error': vm.showError}\" ng-if=\"vm.showError\">\n" +
    "        <div class=\"error-msg\">\n" +
    "            <svg-icon name=\"myProfile-danger-red-icon\" class=\"myProfile-danger-red-icon\"></svg-icon>\n" +
    "            <div translate=\"{{vm.generalError}}\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog-content>");
  $templateCache.put("components/myProfile/components/updateProfile/updateProfile.template.html",
    "<md-dialog-content ng-switch=\"!!vm.showSuccess\">\n" +
    "    <form name=\"profileform\" novalidate class=\"auth-form\" ng-submit=\"vm.updateProfile(profileform)\" ng-switch-when=\"false\">\n" +
    "        <div class=\"znk-input-group\"\n" +
    "             ng-class=\"profileform.nickname.$invalid && profileform.$submitted ? 'invalid' : 'valid'\">\n" +
    "            <label>{{'MY_PROFILE.USERNAME' | translate}}</label>\n" +
    "            <div class=\"znk-input\">\n" +
    "                <input\n" +
    "                        type=\"text\"\n" +
    "                        autocomplete=\"on\"\n" +
    "                        name=\"nickname\"\n" +
    "                        ng-required=\"true\"\n" +
    "                        ng-model=\"vm.profileData.nickname\">\n" +
    "                <span ng-if=\"profileform.$submitted && profileform.nickname.$invalid\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"profileform.nickname.$error.required\"\n" +
    "                              translate=\"{{vm.nicknameError}}\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"znk-input-group\"\n" +
    "             ng-class=\"profileform.email.$invalid && profileform.$submitted ? 'invalid' : 'valid'\">\n" +
    "            <label>{{'MY_PROFILE.EMAIL' | translate}}</label>\n" +
    "            <div class=\"znk-input\">\n" +
    "                <input\n" +
    "                        type=\"email\"\n" +
    "                        autocomplete=\"on\"\n" +
    "                        name=\"email\"\n" +
    "                        ng-required=\"true\"\n" +
    "                        ng-model=\"vm.profileData.email\">\n" +
    "                <span ng-if=\"profileform.$submitted && profileform.email.$invalid\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"profileform.email.$error.required\"\n" +
    "                              translate=\".EMAIL_ERROR\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"znk-input-group\">\n" +
    "            <label for=\"timezone\">{{'MY_PROFILE.TIMEZONE' | translate}}</label>\n" +
    "            <div class=\"znk-input\">\n" +
    "                <select id=\"timezone\" name=\"timezone\"\n" +
    "                        ng-options=\"time as time for time in vm.timezonesList\"\n" +
    "                        ng-model=\"vm.profileData.timezone\"\n" +
    "                        ng-disabled=\"!vm.profileData.isTimezoneManual\">\n" +
    "                </select>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"timezone-manual\">\n" +
    "            <input type=\"checkbox\"\n" +
    "                   id=\"timezoneManual\" name=\"timezoneManual\"\n" +
    "                   ng-model=\"vm.profileData.isTimezoneManual\"\n" +
    "                   ng-change=\"vm.updateProfileTimezone()\">\n" +
    "            <label for=\"timezoneManual\">{{'MY_PROFILE.SET_MANUALLY' | translate}}</label>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <button class=\"save-pass-btn\"><span translate=\"{{vm.saveTitle}}\"></span></button>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "    <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "        <svg-icon class=\"completed-v-icon-wrap\" name=\"myProfile-completed-v-icon\"></svg-icon>\n" +
    "        <div translate=\".PROFILE_SAVE_SUCCESS\"></div>\n" +
    "        <div class=\"done-btn-wrap\">\n" +
    "            <md-button class=\"success drop-shadow md-primary green znk\" ng-click=\"vm.closeDialog()\">\n" +
    "                <span translate=\".DONE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"msg-wrap\" ng-class=\"{'show-error': vm.showError}\" ng-if=\"vm.showError\">\n" +
    "        <div class=\"error-msg\">\n" +
    "            <svg-icon name=\"myProfile-danger-red-icon\" class=\"myProfile-danger-red-icon\"></svg-icon>\n" +
    "            <div translate=\"{{vm.generalError}}\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog-content>");
  $templateCache.put("components/myProfile/svg/close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/myProfile/svg/completed-v.svg",
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
  $templateCache.put("components/myProfile/svg/error-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"error-icon\"\n" +
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
  $templateCache.put("components/myProfile/svg/profile-icon.svg",
    "<svg version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 140.7 171.1\" xml:space=\"preserve\" class=\"profile-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.profile-svg {width: 100%; height: auto;}\n" +
    "	.profile-svg .st0{fill:#000000;}\n" +
    "</style>\n" +
    "\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M0.2,171.1c-0.9-10.2,0.8-19.6,3.6-28.9c2.9-9.6,9.3-14.6,19.1-15.7c4.1-0.5,8.3-1.1,12.3-2.1c6.1-1.5,10.7-5.1,13.7-11.2\n" +
    "		c-7.7-7.5-13.2-16.5-16.9-26.6c-0.3-0.7-0.9-1.7-1.5-1.8c-6.2-0.8-7.3-5.8-8.4-10.4c-0.9-3.7-0.9-7.6-0.9-11.4\n" +
    "		c0-1.7,0.7-4.4,1.8-4.9c5.5-2.5,3.5-7.2,4.1-11.3c1.3-9.1,2.8-18.3,4.8-27.3c1.8-8.4,7.8-13.3,15.7-16c13.1-4.6,26.4-4,39.9-1.9\n" +
    "		c7.9,1.3,16,1.9,24,2.8c-3.3,10.2-0.9,21.2,1.5,32.2c0.8,3.5,0.9,7.2,1.1,10.9c0.2,3.9-0.4,7.3,3.3,11c5.5,5.5,1.1,22.2-5.8,26.1\n" +
    "		c-1,0.6-2.1,1.6-2.6,2.7c-3.8,9.9-9.2,18.8-17.1,26.2c3.7,7.6,10.2,10.7,17.8,11.9c4.3,0.7,8.9,0.6,12.7,2.3\n" +
    "		c4.2,1.9,9,4.6,11.2,8.3c6.2,10.6,7.4,22.5,7,35C93.7,171.1,47.2,171.1,0.2,171.1z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/myProfile/templates/myProfile.template.html",
    "<md-dialog ng-cloak class=\"my-profile\" translate-namespace=\"MY_PROFILE\">\n" +
    "\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"myProfile-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeDialog()\">\n" +
    "            <svg-icon name=\"myProfile-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "\n" +
    "    <div class=\"main-title\" translate=\".MY_PROFILE\"></div>\n" +
    "\n" +
    "    <update-profile user-profile=\"vm.userProfile\"\n" +
    "                    timezones-list=\"vm.timezonesList\"\n" +
    "                    local-timezone=\"vm.localTimezone\"\n" +
    "                    class=\"change-profile\">\n" +
    "\n" +
    "    </update-profile>\n" +
    "\n" +
    "    <change-password class=\"change-password\"></change-password>\n" +
    "\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/myProfile/templates/toast.template.html",
    "<md-toast ng-cloak  translate-namespace=\"MY_PROFILE\"\n" +
    "          ng-class=\"{'toast-wrap': vm.type === 'success',\n" +
    "                     'toast-wrap-error': vm.type === 'error'}\">\n" +
    "    <div class=\"icon-wrap\">\n" +
    "        <svg-icon name=\"myProfile-completed-v-icon\" ng-if=\"vm.type === 'success'\"></svg-icon>\n" +
    "        <svg-icon name=\"myProfile-close-popup\" ng-if=\"vm.type === 'error'\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"md-toast-content\">\n" +
    "        <div class=\"md-toast-text\" flex>{{vm.msg | translate}}</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-button class=\"close-toast-wrap\" ng-click=\"vm.closeToast()\">\n" +
    "        <svg-icon name=\"myProfile-close-popup\"></svg-icon>\n" +
    "    </md-button>\n" +
    "\n" +
    "</md-toast>\n" +
    "");
}]);
