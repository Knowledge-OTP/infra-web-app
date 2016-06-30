angular.module('demo', ['znk.infra-web-app.iapMsg'])
    .controller('Main', function (IapMsgSrv, $scope) {
        $scope.showRaccoonIapMsg = IapMsgSrv.showRaccoonIapMsg; 
    });
