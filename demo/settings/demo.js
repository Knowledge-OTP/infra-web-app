(function(angular) {

    angular.module('demo', ['znk.infra-web-app.settings'])
        .controller('Main', function ($scope, SettingsSrv) {
            $scope.openPopup = function() {
                SettingsSrv.showChangePassword();
            };
        }).service('ENV', function() {
            this.firebaseAppScopeName = 'sat_app';
            this.fbGlobalEndPoint = 'https://znk-dev.firebaseio.com/';
            this.fbDataEndPoint = 'https://sat-dev.firebaseio.com/';
        });
})(angular);
