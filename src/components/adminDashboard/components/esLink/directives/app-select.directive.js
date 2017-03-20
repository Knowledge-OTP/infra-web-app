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

            function AppSelectController($scope, ENV, $translate, $q) {
                'ngInject';

                var self = this;
                var currentAppName = ENV.firebaseAppScopeName;

                function _setCurrentAppName() {
                    var key = Object.keys(self.appName).filter(function (item) {
                        return currentAppName.indexOf(item.toLowerCase()) > -1;
                    })[0];
                    self.selectedApp = self.appName[key];
                    self.currentApp = key;
                }

                var translationsPromMap = {};
                translationsPromMap.SAT = $translate('ADMIN.ESLINK.SAT');
                translationsPromMap.ACT = $translate('ADMIN.ESLINK.ACT');
                translationsPromMap.TOEFL = $translate('ADMIN.ESLINK.TOEFL');
                translationsPromMap.SATSM = $translate('ADMIN.ESLINK.SATSM');
                $q.all(translationsPromMap).then(function (translatedData) {
                    self.appName = {
                        SAT: translatedData.SAT,
                        ACT: translatedData.ACT,
                        TOEFL: translatedData.TOEFL,
                        SATSM: translatedData.SATSM
                    };
                    _setCurrentAppName();
                });

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
