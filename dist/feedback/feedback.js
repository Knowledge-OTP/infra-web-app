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
        ["feedbackSrv", function(feedbackSrv) {
            'ngInject';

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
