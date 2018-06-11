(function () {
  'use strict';

  angular.module('znk.infra-web-app.oneSignal').run(
    function (OneSignalService) {
      'ngInject';

        OneSignalService.initOneSignal();

        OneSignalService.sendTag("App", "MyZinkerz", (res) => {
            console.log('tags received by server', res);
        });
    });
})();
