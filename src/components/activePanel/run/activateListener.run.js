(function () {
  'use strict';

  angular.module('znk.infra-web-app.activePanel').run(
    function (HangoutsService) {
      'ngInject';
      HangoutsService.listenToHangoutsInvitation();
    }
  );
})();
