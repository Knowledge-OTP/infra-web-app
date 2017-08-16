(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').controller('feedbackCtrl',
        function($log, $mdDialog, $timeout, $http, ENV, UserProfileService, AuthService) {
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
                self.userId = userAuth.uid;
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
        });
})(angular);
