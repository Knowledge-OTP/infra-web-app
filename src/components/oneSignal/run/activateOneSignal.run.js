(function () {
  'use strict';

  angular.module('znk.infra-web-app.oneSignal').run(
    function ($log, OneSignalService, ENV, AuthService) {
      'ngInject';

        OneSignalService.initOneSignal();

        OneSignalService.sendTag('ServiceId', ENV.serviceId, (res) => {
            $log.debug('tags received by server', res);
        });

        AuthService.getAuth().then(authData => {
            if (authData && authData.uid) {
                OneSignalService.sendTag('UID', authData.uid, (res) => {
                    $log.debug('tags received by server', res);
                });
            }
        });
    });
})();
