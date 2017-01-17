(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionBtn', {
            bindings: {
                student: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionBtn/liveSessionBtn.template.html',
            controllerAs: 'vm',
            controller: function ($log, $scope, $mdDialog, LiveSessionSrv, StudentContextSrv, TeacherContextSrv,
                                  PresenceService, ENV, LiveSessionStatusEnum) {
                'ngInject';

                var vm = this;

                this.$onInit = function() {
                    vm.isLiveSessionActive = false;
                    vm.isOffline = true;
                    vm.endSession = endSession;
                    vm.showSessionModal = showSessionModal;
                    getLiveSessionStatus();

                    $scope.$watch('vm.student', function (newStudent) {
                        if (newStudent && angular.isDefined(newStudent.presence)) {
                            vm.isOffline = newStudent.presence === PresenceService.userStatus.OFFLINE;
                        }
                    }, true);

                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(liveSessionStateChanged);
                };

                function getLiveSessionStatus() {
                    LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                        if (liveSessionData) {
                            liveSessionStateChanged(liveSessionData.status);
                        }
                    });
                }

                function showSessionModal() {
                    $mdDialog.show({
                        template: '<live-session-subject-modal student="vm.student"></live-session-subject-modal>',
                        scope: $scope,
                        preserveScope: true,
                        clickOutsideToClose: true
                    });
                }
                function liveSessionStateChanged(newLiveSessionState) {
                    vm.isLiveSessionActive = newLiveSessionState === LiveSessionStatusEnum.CONFIRMED.enum;
                }
                function endSession() {
                    LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                }
            }
        });
})(angular);
