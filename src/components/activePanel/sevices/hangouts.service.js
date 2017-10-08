(function (angular) {
  'use strict';

  angular.module('znk.infra-web-app.activePanel').service('HangoutsService',
    function (ENV, UtilitySrv, UserProfileService, InfraConfigSrv, StorageSrv) {
      'ngInject';

      var self = this;

      // const firebaseStudentUsersPath = ENV.firebaseAppScopeName + 'users';
      // const firebaseEducatorUsersPath = ENV.firebaseDashboardAppScopeName + 'users';

      // self.sentInvitation = sentInvitation;
      self.listenToHangoutsInvitation = listenToHangoutsInvitation;

      // function sentInvitation(studentId, educatorId) {
      //   // const hangoutsSessionGuid = UtilitySrv.general.createGuid();
      //   const studentPath = firebaseStudentPath + ''
      // }

      function listenToHangoutsInvitation() {
        UserProfileService.getCurrUserId().then(function (currUid) {
          InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
            var appName = ENV.firebaseAppScopeName;
            var userLiveSessionPath = appName + '/users/' + currUid + '/hangoutsSession';
            globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, function (hangoutsSessionUri) {
              if (hangoutsSessionUri) {
                openHangoutsPopup(hangoutsSessionUri); // TODO: change to open popup for student
              }
            });
          });
        });
      }

      function openHangoutsPopup(hangoutsUri) {
        console.log(hangoutsUri);
      }

    });
})(angular);
