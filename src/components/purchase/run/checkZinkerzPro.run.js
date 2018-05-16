(function(){
    'use strict';

    angular.module('znk.infra-web-app.purchase').run(
        // execute in APP load, to check if the student have zinkerz pro
        function($log, ENV, purchaseService){
            'ngInject';

            $log.debug('Check Purchase State');
            const isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';

            if (!isTeacherApp) {
                purchaseService.checkPendingStatus();

                // run FB listener through bingToServer to detect whether the user has upgraded to PRO,
                // if true, remove the pending purchase from FB
                purchaseService.listenToPurchaseStatus();
            }

        }
    );
})();
