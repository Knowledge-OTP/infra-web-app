/* eslint new-cap: 0 */


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('appSelect', function () {

        function AppSelectController($scope, $filter, ENV) {
            var self = this;
            var currentAppName = ENV.firebaseAppScopeName;
            var translateFilter = $filter('translate');

            function _setCurrentAppName() {
                var key = Object.keys(self.appName).filter(function (item) {
                    return currentAppName.indexOf(item.toLowerCase()) > -1;
                })[0];
                self.selectedApp = self.appName[key];
                self.currentApp = key;
            }

            self.appName = {
                SAT: translateFilter('ADMIN.ESLINK.SAT'),
                ACT: translateFilter('ADMIN.ESLINK.ACT'),
                TOFEL: translateFilter('ADMIN.ESLINK.TOFEL')
            };
            _setCurrentAppName();

            self.selectApp = function (key) {
                self.selectedApp = self.appName[key];
                self.currentApp = key;
            };
            self.expandIcon = 'expand_more';

            self.znkOpenModal = function () {
                self.expandIcon = 'expand_less';
            };

            $scope.$on('$mdMenuClose', function () {
                self.expandIcon = 'expand_more';
            });

        }

        var directive = {
            templateUrl: 'components/adminDashboard/components/esLink/directives/app-select.template.html',
            restrict: 'E',
            controllerAs: 'vm',
            controller: AppSelectController,
            scope: {
                currentApp: "="
            },
            bindToController: true
        };



        return directive;
    });

})(angular);
