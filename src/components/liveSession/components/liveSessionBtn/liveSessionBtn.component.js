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

                $scope.$watch(function () {
                    return vm.student;
                }, function (newStudent) {
                    if (newStudent && angular.isDefined(newStudent.presence)) {
                        vm.isOffline = newStudent.presence === PresenceService.userStatus.OFFLINE;
                    }
                }, true);

                function liveSessionStateChanged(newLiveSessionData) {
                    vm.isLiveSessionActive = newLiveSessionData === LiveSessionStatusEnum.CONFIRMED.enum;
                }

                function endSession() {
                    LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                }

                this.$onInit = function() {
                    vm.isLiveSessionActive = false;
                    vm.endSession = endSession;
                    vm.isOffline = true;

                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(liveSessionStateChanged);

                    vm.showSessionModal = function () {
                        $mdDialog.show({
                            template: '<live-session-subject-modal student="vm.student"></live-session-subject-modal>',
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true
                        });
                    };
                };
            }
        });
})(angular);
