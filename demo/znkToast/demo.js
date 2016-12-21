(function(angular) {

    angular.module('demo', ['znk.infra-web-app.znkToast'])
        .controller('Main', function ($scope, ZnkToastSrv) {

            $scope.openToastSuccess = function() {
                var type = 'success';
                var msg = 'Your profile has been successfully saved.';
                ZnkToastSrv.showToast(type, msg);
            };

           $scope.openToastError = function() {
                var type = 'error';
                var msg = 'an error has occured!!';
                ZnkToastSrv.showToast(type, msg, {
                    position: 'top left'
                });
            };

            $scope.openToastProgress = function() {
                var type = 'progress';
                var msg = '<span class="progress-title">Processing your recording</span> <span class="progress-content">Do not close the Zinkerz app</span>';
                ZnkToastSrv.showToast(type, msg, {
                    hideDelay: false
                });
            };

            $scope.closeToast = function() {
                ZnkToastSrv.hideToast();
            };
        });
})(angular);
