(function(angular) {

    angular.module('demo', ['znk.infra-web-app.myProfile']).config(function($translateProvider) {
            $translateProvider.useLoader('$translatePartialLoader', {
                    urlTemplate: '/{part}/locale/{lang}.json'
                })
                .preferredLanguage('en');
        })
        .run(function ($rootScope, $translate) {
            $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                $translate.refresh();
            });
        })
        .controller('Main', function ($scope, MyProfileSrv) {
            $scope.openPopup = function() {
                MyProfileSrv.showMyProfile();
            };

            $scope.openToast = function() {
                var type = 'success';
                var msg = 'Your profile has been successfully saved.';
                MyProfileSrv.showToast(type, msg);
            };
        })
        .service('ENV', function() {
            this.firebaseAppScopeName = 'sat_app';
            this.fbGlobalEndPoint = 'https://znk-dev.firebaseio.com/';
            this.fbDataEndPoint = 'https://sat-dev.firebaseio.com/';
        });
})(angular);
