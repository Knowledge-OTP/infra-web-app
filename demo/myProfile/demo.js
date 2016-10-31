(function(angular) {

    angular.module('demo', ['znk.infra-web-app.myProfile'])
        .controller('Main', function ($scope, MyProfileSrv) {
            $scope.openPopup = function() {
                MyProfileSrv.showMyProfile();
            };
        })
        .service('ENV', function() {
            this.firebaseAppScopeName = 'sat_app';
            this.fbGlobalEndPoint = 'https://znk-dev.firebaseio.com/';
            this.fbDataEndPoint = 'https://sat-dev.firebaseio.com/';
        });
})(angular);
