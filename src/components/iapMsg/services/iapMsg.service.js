(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg').service('IapMsgSrv',
        function (raccoonIapMsgSrv) {
            'ngInject';

            this.raccoonTypes = raccoonIapMsgSrv.raccoonTypes;

            this.showRaccoonIapMsg = function(msg,type){
                raccoonIapMsgSrv.showRaccoonIapMsg (msg,type);
                return raccoonIapMsgSrv.closeRaccoonIapMsg;
            };
        }
    );
})(angular);
