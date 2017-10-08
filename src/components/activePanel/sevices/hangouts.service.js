(function (angular) {
  'use strict';

  angular.module('znk.infra-web-app.activePanel').service('HangoutsService',
    function (ENV, UtilitySrv, UserProfileService, InfraConfigSrv, StorageSrv, PopUpSrv, NavigationService) {
      'ngInject';

      var self = this;
      self.listenToHangoutsInvitation = listenToHangoutsInvitation;

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

      function openHangoutsPopup(hangoutsUri, studentId) {
        var confirmationPopup = PopUpSrv.warning('invitation', 'hello', 'yes', 'no');
        confirmationPopup.promise.then(function (res) {
          console.log(res, NavigationService);
          InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
            studentStorage.update('/users/' + studentId + '/hangoutsSession', null);
          });
        });
      }
    });
})(angular);
