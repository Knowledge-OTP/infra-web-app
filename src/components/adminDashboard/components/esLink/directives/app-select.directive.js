/* eslint new-cap: 0 */


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.adminDashboard').directive('appSelect',
        function () {

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

        function AppSelectController($scope, $filter, ENV) {
            'ngInject';

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
                TOEFL: translateFilter('ADMIN.ESLINK.TOEFL'),
                SATSM: translateFilter('ADMIN.ESLINK.SATSM')
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

        return directive;
    });

})(angular);
