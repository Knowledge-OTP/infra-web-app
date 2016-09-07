(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback',
        [
            'ngMaterial',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.user',
            'znk.infra.svgIcon'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'close-popup': 'components/feedback/svg/close-popup.svg',
                    'feedback-icon': 'components/feedback/svg/feedback-icon.svg',
                    'completed-v-feedback-icon': 'components/feedback/svg/completed-v-feedback.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').controller('feedbackCtrl',
        ["$log", "$mdDialog", "$timeout", "$http", "ENV", "UserProfileService", "AuthService", function($log, $mdDialog, $timeout, $http, ENV, UserProfileService, AuthService) {
            'ngInject';

            var self = this;
            var DOORBELLSTATUSOK = 201;
            var ENTER_KEY = String.fromCharCode(13);
            self.success = false;

            UserProfileService.getProfile().then(function (res) {
                var userEmail = res.email;
                self.feedbackData = {
                    email: userEmail
                };
                var userAuth = AuthService.getAuth();
                self.userId = userAuth.auth.uid;
                self.userEmail = userEmail;
            });

            this.sendFrom = function () {
                if (self.feedbackForm.$valid) {
                    self.startLoader = true;
                    var authData = AuthService.getAuth();
                    var postData = angular.copy(self.feedbackData);

                    postData.tags = ENV.firebaseAppScopeName;
                    postData.message += (ENTER_KEY + ENTER_KEY);
                    postData.message += ' APP-NAME: ' + ENV.firebaseAppScopeName + ', UID: ' + (authData ? authData.uid : 'N/A');

                    $http.post(ENV.doorBellSubmitURL, (postData)).then(function (data) {
                        self.fillLoader = true;
                        $timeout(function () {
                            self.startLoader = self.fillLoader = false;
                        }, 100);

                        if (data.status === DOORBELLSTATUSOK) {
                            self.success = true;
                        }
                    }, function (message) {
                        $log.error(message);

                        self.fillLoader = true;
                        $timeout(function () {
                            self.startLoader = self.fillLoader = false;
                        }, 100);
                    });
                }
            };
            this.cancel = function () {
                $mdDialog.cancel();
            };
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').directive('feedback',
        ["feedbackSrv", "$translatePartialLoader", function(feedbackSrv, $translatePartialLoader) {
            'ngInject';
            $translatePartialLoader.addPart('feedback');

            var directive = {
                restrict: 'E',
                template: '<button class="feedback-btn" ng-click="showDialog()"><span translate="FEEDBACK_POPUP.FEEDBACK"></span></button>',
                scope: {},
                link: function link(scope) {
                    scope.showDialog = function () {
                        feedbackSrv.showFeedbackDialog();
                    };
                }
            };
            return directive;
        }]);
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.feedback').service('feedbackSrv',

        ["$mdDialog", function($mdDialog) {
            'ngInject';

            this.showFeedbackDialog = function () {
                $mdDialog.show({
                    controller: 'feedbackCtrl',
                    controllerAs: 'vm',
                    templateUrl: 'components/feedback/templates/feedback.template.html',
                    clickOutsideToClose: true
                });
            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.feedback').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/feedback/svg/close-popup.svg",
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
  $templateCache.put("components/feedback/svg/completed-v-feedback.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-1040 834.9 220.4 220.4\" xml:space=\"preserve\" class=\"completed-v-feedback-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.completed-v-feedback-svg {width: 100%; height: auto;}\n" +
    "	.completed-v-feedback-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.completed-v-feedback-svg .st1{fill:#CACBCC;}\n" +
    "	.completed-v-feedback-svg .st2{display:none;fill:none;}\n" +
    "	.completed-v-feedback-svg .st3{fill:#D1D2D2;}\n" +
    "	.completed-v-feedback-svg .st4{fill:none;stroke:#FFFFFF;stroke-width:11.9321;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/feedback/svg/feedback-icon.svg",
    "<svg version=\"1.1\"\n" +
    "	 xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 116.4 115.7\"\n" +
    "	 xml:space=\"preserve\" class=\"feedback-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.feedback-icon-svg {width: 100%; height: auto;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path d=\"M116.4,92.8C97.8,76.9,76.5,69.3,51.6,71.4c0-16.4,0-33,0-51C75.3,20.6,97.4,15,116.4,0C116.4,30.9,116.4,61.9,116.4,92.8z\n" +
    "		\"/>\n" +
    "	<path d=\"M0,32.7C5.4,22.9,13.6,19,24.7,20.2c5.7,0.6,11.4,0.1,17.9,0.1c0,16.7,0,33.1,0,50.4C27.8,68.7,11,77.1,0,60\n" +
    "		C0,50.9,0,41.8,0,32.7z\"/>\n" +
    "	<path d=\"M23.3,115.7c-9.8-8.4-6.8-19.7-6.8-30.3c0-1,19.8-3.1,26.1-1.3c3,0.8,1.2,24.5,0.6,31.6C36.6,115.7,30,115.7,23.3,115.7z\"\n" +
    "		/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/feedback/templates/feedback.template.html",
    "<div class=\"feedback-dialog\">\n" +
    "    <md-dialog class=\"base base-border-radius feedback-container\" translate-namespace=\"FEEDBACK_POPUP\">\n" +
    "        <div class=\"top-icon-wrap\">\n" +
    "            <div class=\"top-icon\">\n" +
    "                <div class=\"round-icon-wrap\">\n" +
    "                    <svg-icon name=\"feedback-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"close-popup-wrap\" ng-click=\"vm.cancel();\">\n" +
    "                <svg-icon name=\"close-popup\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"feedback-inner\">\n" +
    "                <div class=\"main-title\" translate=\".FEEDBACK\"></div>\n" +
    "                <ng-switch on=\"vm.success\">\n" +
    "                    <section ng-switch-when=\"false\">\n" +
    "                        <div class=\"sub-title\" translate=\".THINK\"></div>\n" +
    "                        <form novalidate name=\"vm.feedbackForm\" class=\"base-form\" ng-submit=\"vm.sendFrom();\">\n" +
    "\n" +
    "							<textarea\n" +
    "                                    required\n" +
    "                                    name=\"messageFeedback\"\n" +
    "                                    ng-model=\"vm.feedbackData.message\"\n" +
    "                                    placeholder=\"{{'FEEDBACK_POPUP.MESSAGE' | translate}}\">\n" +
    "                            </textarea>\n" +
    "\n" +
    "                            <label\n" +
    "                                    ng-class=\"{'hidden': !(vm.feedbackForm.messageFeedback.$invalid && vm.feedbackForm.$submitted) }\"\n" +
    "                                    translate=\".REQUIRED_FIELD\">\n" +
    "                            </label>\n" +
    "\n" +
    "                            <input\n" +
    "                                    required\n" +
    "                                    type=\"email\"\n" +
    "                                    name=\"emailFeedback\"\n" +
    "                                    placeholder=\"{{'FEEDBACK_POPUP.EMAIL' | translate}}\"\n" +
    "                                    ng-model=\"vm.feedbackData.email\"\n" +
    "                                    ng-minlength=\"5\"\n" +
    "                                    ng-maxlength=\"254\">\n" +
    "\n" +
    "                            <label\n" +
    "                                    ng-class=\"{'hidden': !(vm.feedbackForm.emailFeedback.$invalid && vm.feedbackForm.$submitted) }\"\n" +
    "                                    translate=\".CORRECT_EMAIL\">\n" +
    "                            </label>\n" +
    "\n" +
    "                            <button\n" +
    "                                    class=\"md-button success success-green drop-shadow\"\n" +
    "                                    element-loader\n" +
    "                                    fill-loader=\"vm.fillLoader\"\n" +
    "                                    show-loader=\"vm.startLoader\"\n" +
    "                                    bg-loader=\"'#72ab40'\"\n" +
    "                                    precentage=\"50\"\n" +
    "                                    font-color=\"'#FFFFFF'\"\n" +
    "                                    bg=\"'#87ca4d'\">\n" +
    "                                <span translate=\".SEND\"></span>\n" +
    "                            </button>\n" +
    "                            <div class=\"user-details-border\"></div>\n" +
    "                            <div class=\"user-email\" ng-if=\"vm.userEmail\" translate=\".USER_EMAIL\"\n" +
    "                                 translate-values=\"{userEmail: vm.userEmail}\"></div>\n" +
    "                            <div class=\"user-id\" ng-if=\"vm.userId\" translate=\".USER_ID\"\n" +
    "                                 translate-values=\"{userId: vm.userId}\"></div>\n" +
    "                        </form>\n" +
    "                    </section>\n" +
    "                    <section ng-switch-default class=\"success-feedback\">\n" +
    "                        <svg-icon name=\"completed-v-feedback-icon\"></svg-icon>\n" +
    "                        <div class=\"success-msg\">\n" +
    "                            <div translate=\".THANKS\"></div>\n" +
    "                            <div translate=\".OPINION\"></div>\n" +
    "                        </div>\n" +
    "                        <md-button\n" +
    "                                class=\"success success-green drop-shadow\"\n" +
    "                                ng-click=\"vm.cancel();\">\n" +
    "                            <span translate=\".DONE\"></span>\n" +
    "                        </md-button>\n" +
    "                    </section>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </md-dialog>\n" +
    "</div>\n" +
    "");
}]);
