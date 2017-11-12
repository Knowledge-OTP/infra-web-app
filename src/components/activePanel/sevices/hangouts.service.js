(function (angular) {
  'use strict';

  angular.module('znk.infra-web-app.activePanel').service('HangoutsService',
    function (ENV, UtilitySrv, UserProfileService, InfraConfigSrv, StorageSrv, PopUpSrv, NavigationService) {
      'ngInject';

      var self = this;
      self.listenToHangoutsInvitation = listenToHangoutsInvitation;

      const isStudent = ENV.appContext.toLowerCase() === 'student';

      function listenToHangoutsInvitation() {
        if (isStudent) {
          UserProfileService.getCurrUserId().then(function (currUid) {
            InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
              var appName = ENV.firebaseAppScopeName;
              var userLiveSessionPath = appName + '/users/' + currUid + '/hangoutsSession';
              globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, function (hangoutsSessionData) {
                if (hangoutsSessionData) {
                  openHangoutsPopup(hangoutsSessionData, currUid); // TODO: change to open popup for student
                }
              });
            });
          });
        }
      }

      function openHangoutsPopup(hangoutsSessionData, studentId) {
        var joinHangoutsSession = function () {
          NavigationService.navigateToUrl(hangoutsSessionData.hangoutsUri);
        };
        PopUpSrv.warning('Hangouts Invitation Received', 'Please click Connect below to join your teacher\'s hangout session?', 'Cancel', 'Connect', joinHangoutsSession);
        InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
          studentStorage.update('/users/' + studentId + '/hangoutsSession', null);
        });
      }
    });
})(angular);
