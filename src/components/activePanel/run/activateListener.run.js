(function(){
  'use strict';

  angular.module('znk.infra-web-app.activePanel').run(
      function(HangoutsService){
          'ngInject';
          console.log('listen to hangouts invitation');
          HangoutsService.listenToHangoutsInvitation();
      }
  );
})();
