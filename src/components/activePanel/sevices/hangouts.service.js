(function (angular) {
  'use strict';

  angular.module('znk.infra-web-app.activePanel').service('HangoutsService',
    function (ENV, UtilitySrv, UserProfileService, InfraConfigSrv, StorageSrv, PopUpSrv, NavigationService) {
      'ngInject';

      var self = this;
      self.listenToHangoutsInvitation = listenToHangoutsInvitation;

      const hangoutsUrl = 'https://hangouts.google.com/call/';
      const isStudent = ENV.appContext.toLowerCase() === 'student';

      function listenToHangoutsInvitation() {
        if (isStudent) {
          UserProfileService.getCurrUserId().then(function (currUid) {
            InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
              var appName = ENV.firebaseAppScopeName;
              var userLiveSessionPath = appName + '/users/' + currUid + '/hangoutsSession';
              globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, function (hangoutsSessionUri) {
                if (hangoutsSessionUri) {
                  openHangoutsPopup(hangoutsSessionUri, currUid); // TODO: change to open popup for student
                }
              });
            });
          });
        }
      }

      function openHangoutsPopup(hangoutsUri, studentId) {
        var navFunc = function () {
          NavigationService.navigateToUrl(hangoutsUrl, hangoutsUri);
        };
        PopUpSrv.warning('invitation', 'hello', 'yes', 'no', navFunc);
        InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
          studentStorage.update('/users/' + studentId + '/hangoutsSession', null);
        });
        // confirmationPopup.promise.then(function (res) {
        //   console.log(res, NavigationService);
        // });
      }
    });
})(angular);
