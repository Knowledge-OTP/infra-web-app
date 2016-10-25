(function(angular) {

    angular.module('demo', ['znk.infra-web-app.settings'])
        .config(function($translateProvider) {
            'ngInject';
            $translateProvider.preferredLanguage('en');
            $translateProvider.useSanitizeValueStrategy(null);

    })
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
