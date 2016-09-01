(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('regComponentContextSrv', [
        function () {
            var self = this;

            this.contextObj = {
                appContext: '',
                userContext: ''
            };

            this.availableApps = {
                SAT: {
                    id: 'SAT',
                    name: 'SAT'
                },
                ACT: {
                    id: 'ACT',
                    name: 'ACT'
                }
            };

            /**
             * Sets the app for teacher / student mode
             * @param userContext
             */
            this.setUserContext = function (userContext) {
                self.contextObj = userContext;
            };


            /**
             * Sets which login app to use
             * @param appContext
             */
            this.setAppContext = function (appContext) {
                self.contextObj = appContext;
            };

            /**
             * Get the app for teacher / student mode
             * @param userContext
             */
            this.getUserContext = function () {
                return self.contextObj.userContext;
            };


            /**
             * Get the currenty appContext
             */
            this.getAppContext = function () {
                return self.contextObj.appContext;
            };

            /**
             * Get an object map of the available apps to log in to
             */
            this.getAvailableApps = function () {
                return self.availableApps;
            };

            /**
             * Get the default app to login to
             */
            this.getDefaultApp = function () {
                return self.availableApps.SAT;
            };
        }
    ]);
})(angular);
