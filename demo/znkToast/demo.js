(function(angular) {

    angular.module('demo', ['znk.infra-web-app.znkToast'])
        .controller('Main', function ($scope, ZnkToastSrv) {

            $scope.openToast = function() {
                var type = 'success';
                var msg = 'Your profile has been successfully saved.';
                ZnkToastSrv.showToast(type, msg);
            };
        });
})(angular);
